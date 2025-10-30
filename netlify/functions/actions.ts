import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { getUser, requireAuth, canAccessSite, CORS_HEADERS } from './auth.js';
import { randomUUID } from 'crypto';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    const user = requireAuth(getUser(context));
    const { siteId, status, assigneeId } = event.queryStringParameters || {};

    switch (event.httpMethod) {
      case 'GET': {
        let query = supabase.from('actions').select('data');

        if (siteId) {
          query = query.eq('site_id', siteId);
        }

        const { data, error } = await query;
        if (error) throw error;

        const actions = (data || [])
          .map((row: any) => row.data)
          .filter((data: any) => {
            if (siteId && data.siteId !== siteId && !canAccessSite(user, data.siteId)) return false;
            if (status && data.status !== status) return false;
            if (assigneeId && data.assignee?.id !== assigneeId) return false;
            return true;
          });

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify(actions)
        };
      }

      case 'POST': {
        const action = JSON.parse(event.body || '{}');

        if (!action.siteId || !canAccessSite(user, action.siteId)) {
          return {
            statusCode: 403,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Access denied to site' }),
          };
        }

        const actionId = randomUUID();
        const now = new Date().toISOString();
        const record = {
          ...action,
          actionId,
          createdAt: now,
          updatedAt: now,
        };

        const { error } = await supabase.from('actions').insert({
          action_id: actionId,
          site_id: action.siteId,
          data: record
        });

        if (error) throw error;

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify(record),
        };
      }

      default:
        return {
          statusCode: 405,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }
    console.error('actions function error', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
