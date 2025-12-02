// Netlify Function for audits CRUD operations
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
        // Get single audit by ID
        if (params.id) {
          const { data, error } = await supabase
            .from('audits')
            .select('*')
            .eq('audit_id', params.id)
            .single();

          if (error) throw error;
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ audit: data?.data || data }),
          };
        }

        // Get all audits, optionally filtered by station
        let query = supabase.from('audits').select('*');

        if (params.station) {
          query = query.eq('site_id', params.station);
        }

        // Order by created_at descending
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        // Extract audit data from JSONB
        const audits = (data || []).map(row => row.data || row);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ audits, total: audits.length }),
        };
      }

      case 'POST': {
        const body = JSON.parse(event.body);
        const audit = body;

        // Prepare the record for Supabase
        const date = new Date(audit.date);
        const record = {
          audit_id: audit.id,
          site_id: audit.location,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          data: audit,
          created_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('audits')
          .upsert(record, { onConflict: 'audit_id' })
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ audit: data?.data || audit, success: true }),
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

        // First get the existing audit
        const { data: existing, error: fetchError } = await supabase
          .from('audits')
          .select('*')
          .eq('audit_id', id)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        // Merge updates with existing data
        const updatedAudit = existing
          ? { ...existing.data, ...updates }
          : { id, ...updates };

        const date = new Date(updatedAudit.date || new Date());
        const record = {
          audit_id: id,
          site_id: updatedAudit.location,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          data: updatedAudit,
          created_at: existing?.created_at || new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from('audits')
          .upsert(record, { onConflict: 'audit_id' })
          .select()
          .single();

        if (error) throw error;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ audit: data?.data || updatedAudit, success: true }),
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

        const { error } = await supabase
          .from('audits')
          .delete()
          .eq('audit_id', id);

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
    console.error('Audits API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
