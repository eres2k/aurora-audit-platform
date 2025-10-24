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
  } catch (error) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  switch (event.httpMethod) {
    case 'GET': {
      const list = await store.list();
      const actions: unknown[] = [];

      for (const blob of list.blobs) {
        const actionRaw = await store.get(blob.key);
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
};
