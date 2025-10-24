import type { Handler, HandlerEvent } from '@netlify/functions';
import jwt from 'jsonwebtoken';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  try {
    const decoded = jwt.decode(token) as any;

    return {
      statusCode: 200,
      body: JSON.stringify({
        id: decoded.sub,
        email: decoded.email,
        name: decoded.user_metadata?.name || decoded.email,
        role: decoded.app_metadata?.role || 'VIEWER',
        siteIds: decoded.user_metadata?.site_ids || []
      })
    };
  } catch (error) {
    return { statusCode: 401, body: 'Invalid token' };
  }
};
