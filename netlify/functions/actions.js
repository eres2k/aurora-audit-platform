// Netlify Function for actions CRUD operations using Netlify Blobs
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

  const store = getStore('actions');
  const method = event.httpMethod;
  const params = event.queryStringParameters || {};

  try {
    switch (method) {
      case 'GET': {
        // Get single action by ID
        if (params.id) {
          const action = await store.get(params.id, { type: 'json' });
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ action }),
          };
        }

        // Get all actions
        const { blobs } = await store.list();
        const actions = [];

        for (const blob of blobs) {
          const action = await store.get(blob.key, { type: 'json' });
          if (action) {
            // Filter by station if specified
            if (!params.station || action.location === params.station) {
              actions.push(action);
            }
          }
        }

        // Sort by createdAt descending
        actions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ actions, total: actions.length }),
        };
      }

      case 'POST': {
        const body = JSON.parse(event.body);

        // Handle bulk insert
        if (body.bulk && Array.isArray(body.actions)) {
          const savedActions = [];
          for (const action of body.actions) {
            await store.setJSON(action.id, action);
            savedActions.push(action);
          }
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ actions: savedActions, success: true }),
          };
        }

        // Single action insert
        const action = body;
        await store.setJSON(action.id, action);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ action, success: true }),
        };
      }

      case 'PUT': {
        const body = JSON.parse(event.body);
        const { id, ...updates } = body;

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Action ID is required' }),
          };
        }

        // Get existing action and merge updates
        const existing = await store.get(id, { type: 'json' });
        const updatedAction = existing
          ? { ...existing, ...updates }
          : { id, ...updates };

        await store.setJSON(id, updatedAction);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ action: updatedAction, success: true }),
        };
      }

      case 'DELETE': {
        const body = JSON.parse(event.body);
        const { id } = body;

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Action ID is required' }),
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
    console.error('Actions API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
