import type { Handler, HandlerEvent } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const MEDIA_STORE = 'media';

const ensureToken = (event: HandlerEvent) => {
  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('Unauthorized');
  }
};

export const handler: Handler = async (event: HandlerEvent) => {
  const store = getStore(MEDIA_STORE);

  if (event.httpMethod === 'POST') {
    try {
      ensureToken(event);
    } catch (error) {
      return { statusCode: 401, body: 'Unauthorized' };
    }

    const mediaId = `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const baseUrl = event.rawUrl.split('?')[0];

    return {
      statusCode: 200,
      body: JSON.stringify({
        mediaId,
        uploadUrl: `${baseUrl}?mediaId=${mediaId}`
      })
    };
  }

  if (event.httpMethod === 'PUT') {
    const { mediaId } = event.queryStringParameters || {};
    if (!mediaId) {
      return { statusCode: 400, body: 'Media ID required' };
    }

    if (!event.body) {
      return { statusCode: 400, body: 'No file provided' };
    }

    const buffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
    const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

    await store.set(mediaId, arrayBuffer, {
      metadata: {
        contentType: event.headers['content-type'] || 'application/octet-stream'
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ mediaId })
    };
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};
