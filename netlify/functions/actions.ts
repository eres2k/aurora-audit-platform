import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { getUser, requireAuth, canAccessSite, CORS_HEADERS } from './auth.js';
import { randomUUID } from 'crypto';

const ACTION_STORE = 'actions';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const user = requireAuth(getUser(context));
    const store = getStore(ACTION_STORE);
    const { siteId, status, assigneeId } = event.queryStringParameters || {};

    switch (event.httpMethod) {
      case 'GET': {
        const list = await store.list();
        const entries = Array.isArray((list as any)?.blobs)
          ? (list as any).blobs
          : Array.isArray((list as any)?.keys)
            ? (list as any).keys.map((key: string) => ({ key }))
            : [];
        const actions: unknown[] = [];

        for (const entry of entries) {
          const key = typeof entry === 'string' ? entry : entry.key;
          const actionRaw = await store.get(key);
          if (!actionRaw) continue;
          const data = JSON.parse(actionRaw);

          if (siteId && data.siteId !== siteId && !canAccessSite(user, data.siteId)) continue;
          if (status && data.status !== status) continue;
          if (assigneeId && data.assignee?.id !== assigneeId) continue;

          actions.push(data);
        }

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify(actions)
        };
      }

      case 'POST': {
        const action = JSON.parse(event.body || '{}');

        if (!action.siteId || !canAccessSite(user, action.siteId)) {
          return {
            statusCode: 403,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Access denied to site' }),
          };
        }

        const actionId = randomUUID();
        const now = new Date().toISOString();
        const record = {
          ...action,
          actionId,
          createdAt: now,
          updatedAt: now,
        };

        const path = `${action.siteId}/${actionId}.json`;
        await store.setJSON(path, record);

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify(record),
        };
      }

      default:
        return {
          statusCode: 405,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }
    console.error('actions function error', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
