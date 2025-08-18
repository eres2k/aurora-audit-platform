const { createClient } = require('@netlify/blobs');
const { v4: uuidv4 } = require('uuid');

// Use token when running locally; Netlify provides auth in production
const client = createClient({ token: process.env.NETLIFY_BLOBS_TOKEN });
const store = client.use('audits');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const user = context.clientContext && context.clientContext.user;
  if (!user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const { id } = event.queryStringParameters || {};
        if (id) {
          const audit = await store.get(id);
          return { statusCode: 200, headers, body: audit || '{}' };
        }
        const list = await store.list();
        const audits = await Promise.all(
          list.blobs.map(async (b) => {
            const data = await store.get(b.key);
            return JSON.parse(data);
          })
        );
        return { statusCode: 200, headers, body: JSON.stringify(audits) };
      }
      case 'POST': {
        const data = JSON.parse(event.body);
        const id = data.id || uuidv4();
        data.id = id;
        await store.setJSON(id, data);
        return { statusCode: 200, headers, body: JSON.stringify(data) };
      }
      case 'PUT': {
        const data = JSON.parse(event.body);
        if (!data.id) throw new Error('Missing id');
        await store.setJSON(data.id, data);
        return { statusCode: 200, headers, body: JSON.stringify(data) };
      }
      case 'DELETE': {
        const { id } = JSON.parse(event.body || '{}');
        if (!id) throw new Error('Missing id');
        await store.delete(id);
        return { statusCode: 200, headers, body: JSON.stringify({ success: true }) };
      }
      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
