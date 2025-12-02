// Netlify Function for actions CRUD operations
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
        // Get single action by ID
        if (params.id) {
          const { data, error } = await supabase
            .from('actions')
            .select('*')
            .eq('action_id', params.id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ action: data?.data || null }),
          };
        }

        // Get all actions, optionally filtered by station
        let query = supabase.from('actions').select('*');

        if (params.station) {
          query = query.eq('site_id', params.station);
        }

        // Order by created_at descending
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        // Extract action data from JSONB
        const actions = (data || []).map(row => row.data || row);

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
          const records = body.actions.map(action => ({
            action_id: action.id,
            site_id: action.location,
            data: action,
            created_at: new Date().toISOString(),
          }));

          const { data, error } = await supabase
            .from('actions')
            .upsert(records, { onConflict: 'action_id' })
            .select();

          if (error) throw error;

          const actions = (data || []).map(row => row.data);
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify({ actions, success: true }),
          };
        }

        // Single action insert
        const action = body;
        const record = {
          action_id: action.id,
          site_id: action.location,
          data: action,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('actions')
          .upsert(record, { onConflict: 'action_id' })
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ action: data?.data || action, success: true }),
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

        // First get the existing action
        const { data: existing, error: fetchError } = await supabase
          .from('actions')
          .select('*')
          .eq('action_id', id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        // Merge updates with existing data
        const updatedAction = existing
          ? { ...existing.data, ...updates }
          : { id, ...updates };

        const record = {
          action_id: id,
          site_id: updatedAction.location,
          data: updatedAction,
          created_at: existing?.created_at || new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('actions')
          .upsert(record, { onConflict: 'action_id' })
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ action: data?.data || updatedAction, success: true }),
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

        const { error } = await supabase
          .from('actions')
          .delete()
          .eq('action_id', id);

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
    console.error('Actions API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
