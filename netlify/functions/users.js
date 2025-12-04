// Netlify Function for users CRUD operations using Netlify Blobs
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

  const store = getStore('users');
  const method = event.httpMethod;
  const params = event.queryStringParameters || {};

  try {
    switch (method) {
      case 'GET': {
        // Get single user by ID
        if (params.id) {
          const userData = await store.get(params.id, { type: 'json' });
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ user: userData }),
          };
        }

        // Get all users
        const { blobs } = await store.list();
        const users = [];

        for (const blob of blobs) {
          const userData = await store.get(blob.key, { type: 'json' });
          if (userData) {
            users.push(userData);
          }
        }

        // Sort by registration date descending
        users.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ users, total: users.length }),
        };
      }

      case 'POST': {
        const userData = JSON.parse(event.body);

        // Check if user already exists
        const existingUser = await store.get(userData.id, { type: 'json' });

        if (existingUser) {
          // Update last login time
          const updatedUser = {
            ...existingUser,
            lastLoginAt: new Date().toISOString(),
          };
          await store.setJSON(userData.id, updatedUser);

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ user: updatedUser, success: true, isNew: false }),
          };
        }

        // Create new user record
        const newUser = {
          ...userData,
          registeredAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await store.setJSON(userData.id, newUser);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ user: newUser, success: true, isNew: true }),
        };
      }

      case 'PUT': {
        const body = JSON.parse(event.body);
        const { id, ...updates } = body;

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'User ID is required' }),
          };
        }

        // Get existing user and merge updates
        const existing = await store.get(id, { type: 'json' });
        const updatedUser = existing ? { ...existing, ...updates, updatedAt: new Date().toISOString() } : { id, ...updates };

        await store.setJSON(id, updatedUser);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ user: updatedUser, success: true }),
        };
      }

      case 'DELETE': {
        const body = JSON.parse(event.body);
        const { id } = body;

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'User ID is required' }),
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
    console.error('Users API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
