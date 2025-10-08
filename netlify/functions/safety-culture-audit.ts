import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'safety-culture-audits';

function getUserId(event: Parameters<Handler>[0]) {
  const user = event.clientContext?.user as { sub?: string; id?: string } | undefined;
  return user?.sub || user?.id || null;
}

export const handler: Handler = async (event) => {
  const userId = getUserId(event);

  if (!userId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Authentication required' }),
    };
  }

  const store = getStore({ name: STORE_NAME });
  const key = `${userId}.json`;

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const existing = await store.get(key, { type: 'json' });
        return {
          statusCode: 200,
          body: JSON.stringify(existing || null),
        };
      }
      case 'PUT':
      case 'POST': {
        if (!event.body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing request body' }),
          };
        }

        const payload = JSON.parse(event.body);
        const enriched = {
          ...payload,
          updatedAt: new Date().toISOString(),
        };

        await store.setJSON(key, enriched);

        return {
          statusCode: 200,
          body: JSON.stringify(enriched),
        };
      }
      default:
        return {
          statusCode: 405,
          headers: { Allow: 'GET,PUT,POST' },
          body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    console.error('Safety culture audit handler failed', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

