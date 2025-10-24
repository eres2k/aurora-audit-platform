import type { Handler, HandlerEvent } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const ACTION_STORE = 'actions';

const ensureToken = (event: HandlerEvent) => {
  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('Unauthorized');
  }
};

export const handler: Handler = async (event: HandlerEvent) => {
  const store = getStore(ACTION_STORE);
  const { siteId, status, assigneeId } = event.queryStringParameters || {};

  try {
    ensureToken(event);

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

          if (siteId && data.siteId !== siteId) continue;
          if (status && data.status !== status) continue;
          if (assigneeId && data.assignee?.id !== assigneeId) continue;

          actions.push(data);
        }

        return {
          statusCode: 200,
          body: JSON.stringify(actions)
        };
      }

      case 'POST': {
        const action = JSON.parse(event.body || '{}');
        const actionId = `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();
        const record = {
          ...action,
          actionId,
          createdAt: now,
          updatedAt: now
        };

        await store.set(actionId, JSON.stringify(record));

        return {
          statusCode: 200,
          body: JSON.stringify(record)
        };
      }

      default:
        return { statusCode: 405, body: 'Method Not Allowed' };
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return { statusCode: 401, body: 'Unauthorized' };
    }
    console.error('actions function error', error);
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
