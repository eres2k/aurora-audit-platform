import { Handler } from '@netlify/functions';
import { connectLambda, getStore, type Store } from '@netlify/blobs';
import { v4 as uuidv4 } from 'uuid';
import { buildSafetyCultureAuditDraft } from '../../src/data/safetyCultureTemplate';
import { SafetyCultureAudit } from '../../src/types/safetyCulture';

const STORE_NAME = 'safety-culture-audits';

function getAuditKey(ownerId: string, auditId: string) {
  return `${ownerId}/${auditId}`;
}

function assertOwner(event: Parameters<Handler>[0]) {
  const user = event.clientContext?.user;
  if (!user?.sub) {
    throw Object.assign(new Error('Unauthorized'), { statusCode: 401 });
  }

  return user.sub;
}

async function readAudit(store: Store, key: string) {
  try {
    return (await store.get(key, { type: 'json' })) as SafetyCultureAudit;
  } catch (error) {
    return null;
  }
}

export const handler: Handler = async (event) => {
  try {
    connectLambda(event as any);

    const ownerId = assertOwner(event);
    const store = getStore(STORE_NAME);

    switch (event.httpMethod) {
      case 'GET': {
        const auditId = event.queryStringParameters?.id;
        if (auditId) {
          const audit = await readAudit(store, getAuditKey(ownerId, auditId));
          if (!audit) {
            return { statusCode: 404, body: JSON.stringify({ error: 'Audit not found' }) };
          }

          return { statusCode: 200, body: JSON.stringify(audit) };
        }

        const list = await store.list({ prefix: `${ownerId}/` });
        const audits = await Promise.all(
          list.blobs.map(async (blob) => {
            const audit = (await store.get(blob.key, { type: 'json' })) as SafetyCultureAudit;
            return audit;
          }),
        );

        audits.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

        return { statusCode: 200, body: JSON.stringify(audits) };
      }
      case 'POST': {
        const payload = event.body ? JSON.parse(event.body) : {};
        const baseAudit = payload.audit ?? buildSafetyCultureAuditDraft({ title: payload.title });
        const now = new Date().toISOString();
        const audit: SafetyCultureAudit = {
          ...baseAudit,
          id: uuidv4(),
          ownerId,
          createdAt: now,
          updatedAt: now,
        };

        await store.setJSON(getAuditKey(ownerId, audit.id), audit);

        return { statusCode: 200, body: JSON.stringify(audit) };
      }
      case 'PUT': {
        const payload = event.body ? JSON.parse(event.body) : {};
        const updatedAudit: SafetyCultureAudit | undefined = payload.audit;
        if (!updatedAudit?.id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Audit payload missing id' }) };
        }

        const key = getAuditKey(ownerId, updatedAudit.id);
        const existing = await readAudit(store, key);
        if (!existing) {
          return { statusCode: 404, body: JSON.stringify({ error: 'Audit not found' }) };
        }

        const now = new Date().toISOString();
        const audit: SafetyCultureAudit = {
          ...existing,
          ...updatedAudit,
          ownerId,
          createdAt: existing.createdAt ?? now,
          updatedAt: now,
        };

        await store.setJSON(key, audit);

        return { statusCode: 200, body: JSON.stringify(audit) };
      }
      case 'DELETE': {
        const payload = event.body ? JSON.parse(event.body) : {};
        const { id } = payload as { id?: string };
        if (!id) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing audit id' }) };
        }

        const key = getAuditKey(ownerId, id);
        const existing = await readAudit(store, key);
        if (!existing) {
          return { statusCode: 404, body: JSON.stringify({ error: 'Audit not found' }) };
        }

        await store.delete(key);
        return { statusCode: 204, body: '' };
      }
      default:
        return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
    }
  } catch (error) {
    const statusCode = (error as any)?.statusCode ?? 500;
    const message = (error as Error).message || 'Unexpected error';
    return { statusCode, body: JSON.stringify({ error: message }) };
  }
};
