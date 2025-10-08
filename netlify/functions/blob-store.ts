import { randomUUID } from 'crypto';
import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

interface IdentityUser {
  sub?: string;
  id?: string;
  user_id?: string;
  email?: string;
  [key: string]: unknown;
}

interface NetlifyIdentityContext {
  token?: unknown;
  user?: IdentityUser;
}

interface NetlifyContext {
  identity?: NetlifyIdentityContext;
}

const respond = (statusCode: number, body: unknown) => ({
  statusCode,
  body: body === undefined ? '' : JSON.stringify(body),
  headers: {
    'Content-Type': 'application/json',
  },
});

const collectionName = (name: string) => `safety-culture-${name}`;

const resolveUserId = (user?: IdentityUser) => {
  if (!user) return null;
  return (
    (typeof user.sub === 'string' && user.sub) ||
    (typeof user.id === 'string' && user.id) ||
    (typeof user.user_id === 'string' && user.user_id) ||
    null
  );
};

const handler: Handler = async (event, context) => {
  const identityContext = (context as NetlifyContext)?.identity;
  const user = identityContext?.user;
  const ownerId = resolveUserId(user);

  if (!ownerId) {
    return respond(401, { message: 'Authentication required. Please sign in with Netlify Identity.' });
  }

  const collection = event.queryStringParameters?.collection;
  if (!collection) {
    return respond(400, { message: 'Missing collection name.' });
  }

  const store = getStore({ name: collectionName(collection) });
  const keyFor = (id: string) => `${ownerId}/${id}`;

  try {
    switch (event.httpMethod?.toUpperCase()) {
      case 'GET': {
        const id = event.queryStringParameters?.id;
        if (id) {
          const data = await store.get(keyFor(id), { type: 'json' });
          if (!data) {
            return respond(404, { message: 'Record not found.' });
          }
          return respond(200, data);
        }

        const listing = await store.list({ prefix: `${ownerId}/` });
        const items = await Promise.all(
          listing.blobs.map(async (blob) => store.get(blob.key, { type: 'json' }))
        );
        return respond(200, items.filter(Boolean));
      }
      case 'POST':
      case 'PUT': {
        const payload = event.body ? JSON.parse(event.body) : {};
        const now = new Date().toISOString();
        const incomingId: string | undefined = payload.id;
        const id = incomingId && typeof incomingId === 'string' && incomingId.length > 0 ? incomingId : randomUUID();
        const key = keyFor(id);
        const existing = await store.get(key, { type: 'json' });

        const record = {
          ...(existing ?? {}),
          ...payload,
          id,
          ownerId,
          ownerEmail: user?.email,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };

        await store.set(key, JSON.stringify(record), {
          metadata: {
            ownerId,
            collection,
          },
        });

        return respond(200, record);
      }
      case 'DELETE': {
        const id = event.queryStringParameters?.id;
        if (!id) {
          return respond(400, { message: 'Missing record identifier.' });
        }
        await store.delete(keyFor(id));
        return { statusCode: 204, body: '' };
      }
      default:
        return respond(405, { message: 'Method not allowed.' });
    }
  } catch (error) {
    console.error('Blob store function error', error);
    return respond(500, {
      message: 'Unexpected error while processing Netlify Blob request.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export { handler };
