// Netlify Function for templates CRUD operations using Netlify Blobs
import { getBlobStore } from './lib/blob-store.js';

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

  const store = getBlobStore('templates');
  const method = event.httpMethod;
  const params = event.queryStringParameters || {};

  try {
    switch (method) {
      case 'GET': {
        // Get single template by ID
        if (params.id) {
          const template = await store.get(params.id, { type: 'json' });
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ template }),
          };
        }

        // Get all templates
        const { blobs } = await store.list();
        const templates = [];

        for (const blob of blobs) {
          const template = await store.get(blob.key, { type: 'json' });
          if (template) {
            templates.push(template);
          }
        }

        // Sort by createdAt descending
        templates.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ templates, total: templates.length }),
        };
      }

      case 'POST': {
        const template = JSON.parse(event.body);
        template.createdAt = template.createdAt || new Date().toISOString();
        template.createdBy = template.createdBy || user.email;

        await store.setJSON(template.id, template);

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ template, success: true }),
        };
      }

      case 'PUT': {
        const body = JSON.parse(event.body);
        const { id, ...updates } = body;

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Template ID is required' }),
          };
        }

        // Get existing template and merge updates
        const existing = await store.get(id, { type: 'json' });
        const updatedTemplate = existing
          ? { ...existing, ...updates, updatedAt: new Date().toISOString() }
          : { id, ...updates, updatedAt: new Date().toISOString() };

        await store.setJSON(id, updatedTemplate);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ template: updatedTemplate, success: true }),
        };
      }

      case 'DELETE': {
        const body = JSON.parse(event.body);
        const { id } = body;

        if (!id) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Template ID is required' }),
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
    console.error('Templates API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
