import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { getUser, requireAuth, CORS_HEADERS } from './auth';
import { randomUUID } from 'crypto';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    requireAuth(getUser(context));

    // Validate required environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Server configuration error',
          details: 'Missing required Supabase configuration'
        })
      };
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

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

      // Get signed upload URL from Supabase Storage
      const { data, error } = await supabase.storage
        .from('media')
        .createSignedUploadUrl(mediaId);

      if (error) throw error;

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          mediaId: `media://${mediaId}`,
          uploadUrl: data.signedUrl,
        }),
      };
    }

    if (event.httpMethod === 'PUT') {
      // This might not be needed if using signed URLs, but keep for compatibility
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Use the signed upload URL for uploads' }),
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
