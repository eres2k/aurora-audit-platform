// Netlify Function for templates CRUD operations
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const getSupabase = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

// CORS headers
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json',
};

exports.handler = async (event, context) => {
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

  const supabase = getSupabase();
  const method = event.httpMethod;
  const params = event.queryStringParameters || {};

  try {
    switch (method) {
      case 'GET': {
        // Get single template by ID
        if (params.id) {
          const { data, error } = await supabase
            .from('templates')
            .select('*')
            .eq('template_id', params.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ template: data?.data || null }),
          };
        }

        // Get all templates
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Extract template data from JSONB
        const templates = (data || []).map(row => row.data || row);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ templates, total: templates.length }),
        };
      }

      case 'POST': {
        const body = JSON.parse(event.body);
        const template = body;

        // Prepare the record for Supabase
        const record = {
          template_id: template.id,
          data: template,
          created_by: user.email,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('templates')
          .upsert(record, { onConflict: 'template_id' })
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ template: data?.data || template, success: true }),
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

        // First get the existing template
        const { data: existing, error: fetchError } = await supabase
          .from('templates')
          .select('*')
          .eq('template_id', id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        // Merge updates with existing data
        const updatedTemplate = existing
          ? { ...existing.data, ...updates }
          : { id, ...updates };

        const record = {
          template_id: id,
          data: updatedTemplate,
          created_by: existing?.created_by || user.email,
          created_at: existing?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('templates')
          .upsert(record, { onConflict: 'template_id' })
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ template: data?.data || updatedTemplate, success: true }),
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

        const { error } = await supabase
          .from('templates')
          .delete()
          .eq('template_id', id);

        if (error) throw error;

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
