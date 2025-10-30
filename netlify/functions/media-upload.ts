import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { getUser, requireAuth, CORS_HEADERS } from './auth.js';
import { randomUUID } from 'crypto';

const MEDIA_STORE = 'media';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    requireAuth(getUser(context));
    const store = getStore(MEDIA_STORE);

    if (event.httpMethod === 'POST') {
      const { auditId } = JSON.parse(event.body || '{}');
      if (!auditId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'auditId required' }),
        };
      }

      const assetId = randomUUID();
      const mediaId = `${auditId}/${assetId}.webp`;
      const baseUrl = event.rawUrl.split('?')[0];

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          mediaId: `media://${mediaId}`,
          uploadUrl: `${baseUrl}?mediaId=${mediaId}`,
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      const { mediaId } = event.queryStringParameters || {};
      if (!mediaId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Media ID required' }),
        };
      }

      if (!event.body) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'No file provided' }),
        };
      }

      const buffer = Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8');
      const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

      await store.set(mediaId, arrayBuffer, {
        metadata: {
          contentType: event.headers['content-type'] || 'application/octet-stream',
        },
      });

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ mediaId }),
      };
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch (error) {
    console.error('Media upload error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
