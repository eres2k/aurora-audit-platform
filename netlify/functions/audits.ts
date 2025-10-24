import type { Handler, HandlerEvent } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const AUDIT_STORE = 'audits';

const ensureToken = (event: HandlerEvent) => {
  const token = event.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw new Error('Unauthorized');
  }
};

export const handler: Handler = async (event: HandlerEvent) => {
  const store = getStore(AUDIT_STORE);
  const { id, action, siteId, from, to, templateId } = event.queryStringParameters || {};

  try {
    ensureToken(event);
  } catch (error) {
    return { statusCode: 401, body: 'Unauthorized' };
  }

  switch (event.httpMethod) {
    case 'GET': {
      if (id) {
        const audit = await store.get(id);
        return {
          statusCode: 200,
          body: audit ?? '{}'
        };
      }

      const list = await store.list();
      const audits: unknown[] = [];

      for (const blob of list.blobs) {
        const auditRaw = await store.get(blob.key);
        if (!auditRaw) continue;
        const data = JSON.parse(auditRaw);

        if (siteId && data.siteId !== siteId) continue;
        if (from && data.completedAt && new Date(data.completedAt) < new Date(from)) continue;
        if (to && data.completedAt && new Date(data.completedAt) > new Date(to)) continue;
        if (templateId && data.templateId !== templateId) continue;

        audits.push(data);
      }

      return {
        statusCode: 200,
        body: JSON.stringify(audits)
      };
    }

    case 'POST': {
      if (action === 'complete') {
        if (!id) {
          return { statusCode: 400, body: 'Audit ID required' };
        }
        const audit = JSON.parse(event.body || '{}');
        audit.completedAt = new Date().toISOString();
        audit.status = 'COMPLETED';
        const total = (audit.items || []).filter((i: any) => i.response !== 'NA').length;
        const passed = (audit.items || []).filter((i: any) => i.response === 'YES').length;
        audit.score = {
          total,
          passed,
          percent: total > 0 ? Math.round((passed / total) * 100) : 0
        };
        await store.set(id, JSON.stringify(audit));

        return {
          statusCode: 200,
          body: JSON.stringify(audit)
        };
      }

      const audit = JSON.parse(event.body || '{}');
      const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      audit.auditId = auditId;
      await store.set(auditId, JSON.stringify(audit));

      return {
        statusCode: 200,
        body: JSON.stringify(audit)
      };
    }

    case 'PUT': {
      if (!id) {
        return { statusCode: 400, body: 'Audit ID required' };
      }
      const audit = JSON.parse(event.body || '{}');
      await store.set(id, JSON.stringify(audit));

      return {
        statusCode: 200,
        body: JSON.stringify(audit)
      };
    }

    default:
      return { statusCode: 405, body: 'Method Not Allowed' };
  }
};
