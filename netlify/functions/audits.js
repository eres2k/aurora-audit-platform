// Netlify Function for audits CRUD operations using Netlify Blobs
import { getStore } from '@netlify/blobs';

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

export const handler = async (event, context) => {
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  // Get the user from the Netlify Identity context
  const { user } = context.clientContext || {};

  // If no user is authenticated, return 401
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const store = getStore('audits');
  const method = event.httpMethod;
  const params = event.queryStringParameters || {};

  try {
    switch (method) {
      case 'GET': {
        // Get single audit by ID
        if (params.id) {
          const audit = await store.get(params.id, { type: 'json' });
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ audit }),
          };
        }

        // Get all audits
        const { blobs } = await store.list();
        const audits = [];

        for (const blob of blobs) {
          const audit = await store.get(blob.key, { type: 'json' });
          if (audit) {
            // Filter by station if specified
            if (!params.station || audit.location === params.station) {
              audits.push(audit);
            }
          }
        }

        // Sort by date descending
        audits.sort((a, b) => new Date(b.date) - new Date(a.date));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ audits, total: audits.length }),
        };
      }

      case 'POST': {
        const audit = JSON.parse(event.body);
        await store.setJSON(audit.id, audit);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ audit, success: true }),
        };
      }

      case 'PUT': {
        const body = JSON.parse(event.body);
        const { id, ...updates } = body;

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Audit ID is required' }),
          };
        }

        // Get existing audit and merge updates
        const existing = await store.get(id, { type: 'json' });
        const updatedAudit = existing ? { ...existing, ...updates } : { id, ...updates };

        await store.setJSON(id, updatedAudit);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ audit: updatedAudit, success: true }),
        };
      }

      case 'DELETE': {
        const body = JSON.parse(event.body);
        const { id } = body;

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Audit ID is required' }),
          };
        }

        await store.delete(id);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true }),
        };
      }

      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Audits API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
