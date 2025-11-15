import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { getUser, requireAuth, canAccessSite, CORS_HEADERS } from './auth';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    // Validate required environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables', {
        hasUrl: !!process.env.SUPABASE_URL,
        hasKey: !!process.env.SUPABASE_ANON_KEY
      });
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Server configuration error',
          details: 'Missing required Supabase configuration. Please contact the administrator.',
          missingVars: [
            !process.env.SUPABASE_URL && 'SUPABASE_URL',
            !process.env.SUPABASE_ANON_KEY && 'SUPABASE_ANON_KEY'
          ].filter(Boolean)
        })
      };
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const user = requireAuth(getUser(context));
    const params = event.queryStringParameters || {};



    if (event.httpMethod === 'POST' && params.action === 'complete' && params.id) {
      const auditId = params.id;
      console.log('Starting complete audit', { auditId, hasBody: !!event.body, userId: user.sub });
      const auditData = JSON.parse(event.body || '{}');
      console.log('Parsed auditData', { siteId: auditData.siteId, templateId: auditData.templateId, itemCount: auditData.items?.length, status: auditData.status });

      if (!auditData.siteId || !auditData.templateId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            error: 'Missing required fields',
            details: 'siteId and templateId are required',
          }),
        };
      }

      const completedAudit: Record<string, unknown> & {
        items?: Array<{ response?: string }>;
        score?: { total: number; passed: number; percent: number };
      } = {
        ...auditData,
        auditId,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        completedBy: user.sub,
        locked: true,
      };

      if (completedAudit.items?.length) {
        const applicable = completedAudit.items.filter(
          (item) => item.response !== 'N/A' && item.response !== 'N.A.'
        );
        const passed = applicable.filter(
          (item) => item.response === 'YES' || item.response === 'PASS'
        );

        completedAudit.score = {
          total: applicable.length,
          passed: passed.length,
          percent: applicable.length > 0 ? Math.round((passed.length / applicable.length) * 100) : 0,
        };
      }

      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const blobPath = `${completedAudit.siteId}/${year}/${month}/${auditId}.json`;
      console.log('Storing audit at', blobPath);

      try {
        // Insert the completed audit
        const { error: insertError } = await supabase.from('audits').insert({
          audit_id: auditId,
          site_id: completedAudit.siteId,
          year: date.getFullYear(),
          month: date.getMonth() + 1,
          data: completedAudit
        });

        if (insertError) {
          console.error('Supabase insert error:', insertError);
          throw insertError;
        }
        console.log('Stored audit successfully');

        // Update the index
        const yearMonth = `${date.getFullYear()}-${month}`;
        const { data: indexData, error: selectError } = await supabase
          .from('audit_index')
          .select('audits')
          .eq('site_id', completedAudit.siteId)
          .eq('year_month', yearMonth)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error('Supabase select index error:', selectError);
          throw selectError;
        }

        let audits = indexData?.audits || [];
        if (!audits.some((a: any) => a.auditId === auditId)) {
          audits.push({
            auditId,
            completedAt: completedAudit.completedAt,
            templateId: completedAudit.templateId,
            score: completedAudit.score,
            auditorName: (completedAudit as any)?.auditor?.name ?? user.email,
          });

          const { error: upsertError } = await supabase.from('audit_index').upsert({
            site_id: completedAudit.siteId,
            year_month: yearMonth,
            audits
          });

          if (upsertError) {
            console.error('Supabase upsert index error:', upsertError);
            throw upsertError;
          }
          console.log('Updated index successfully');
        } else {
          console.log('Audit already in index');
        }

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            auditId,
            message: 'Audit completed successfully',
          }),
        };
      } catch (error) {
        console.error('Storage error:', error);
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            error: 'Failed to store audit',
            details: error instanceof Error ? error.message : 'Unknown error',
          }),
        };
      }
    }

    if (event.httpMethod === 'GET') {
      if (params.id) {
        // Get single audit
        const auditId = params.id;
        // Assume path is siteId/year/month/auditId.json, but need to find it
        // For simplicity, search in index or assume siteId is provided
        const siteId = params.siteId;
        if (!siteId) {
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'siteId parameter required for single audit' }),
          };
        }

        if (!canAccessSite(user, siteId)) {
          return {
            statusCode: 403,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Access denied to site' }),
          };
        }

        try {
          const { data, error } = await supabase
            .from('audits')
            .select('data')
            .eq('audit_id', auditId)
            .eq('site_id', siteId)
            .single();

          if (error) {
            if (error.code === 'PGRST116') {
              return {
                statusCode: 404,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: 'Audit not found' }),
              };
            }
            throw error;
          }

          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify(data.data),
          };
        } catch (error) {
          console.error('Failed to retrieve audit:', error);
          return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Failed to retrieve audit' }),
          };
        }
      } else {
        // List audits
        const siteId = params.siteId;
        if (!siteId) {
          return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'siteId parameter required' }),
          };
        }

        if (!canAccessSite(user, siteId)) {
          return {
            statusCode: 403,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Access denied to site' }),
          };
        }

        try {
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth() + 1;
          const yearMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

          const { data, error } = await supabase
            .from('audit_index')
            .select('audits')
            .eq('site_id', siteId)
            .eq('year_month', yearMonth)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          const audits = data?.audits || [];

          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ audits }),
          };
        } catch (error) {
          console.error('Failed to list audits:', error);
          return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Failed to list audits' }),
          };
        }
      }
    }

    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack:
          process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      }),
    };
  }
};
