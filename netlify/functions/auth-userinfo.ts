import type { Handler } from '@netlify/functions';
import { getUser, requireAuth, CORS_HEADERS } from './auth.js';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const user = requireAuth(getUser(context));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        id: user.sub,
        email: user.email,
        name: user.user_metadata?.name || user.email,
        role: user.app_metadata?.role || 'VIEWER',
        siteIds: user.user_metadata?.site_ids || [],
      }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }
};
