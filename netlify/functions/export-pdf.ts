import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { getUser, requireAuth, canAccessSite, CORS_HEADERS } from './auth.js';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    // Validate required environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return {
        statusCode: 500,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: 'Server configuration error',
          details: 'Missing required Supabase configuration'
        })
      };
    }

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
    const user = requireAuth(getUser(context));
    const { auditId } = JSON.parse(event.body || '{}');
    if (!auditId) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Audit ID required' }),
      };
    }

    const { data, error } = await supabase
      .from('audits')
      .select('data')
      .eq('audit_id', auditId)
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

    const audit = data.data;

    if (!canAccessSite(user, audit.siteId)) {
      return {
        statusCode: 403,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Access denied' }),
      };
    }

    const scorePercent = audit.score?.percent ?? 0;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .header { border-bottom: 2px solid #FF9900; padding-bottom: 20px; margin-bottom: 20px; }
        .title { color: #FF9900; font-size: 24px; font-weight: bold; }
        .score { float: right; font-size: 32px; color: ${scorePercent >= 80 ? '#10B981' : '#F59E0B'}; }
        .section { margin: 20px 0; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .item { margin: 10px 0; padding: 10px; border-left: 4px solid #E5E7EB; }
        .item.pass { border-color: #10B981; }
        .item.fail { border-color: #EF4444; }
        .item.na { border-color: #9CA3AF; }
        .notes { margin-top: 5px; font-style: italic; color: #6B7280; }
        .signatures { margin-top: 40px; display: flex; justify-content: space-around; }
        .signature { text-align: center; }
        .signature-line { border-top: 1px solid black; width: 200px; margin-top: 40px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="score">${scorePercent}%</div>
        <div class="title">AMZL Audit Report</div>
        <div>Site: ${audit.siteName}</div>
        <div>Date: ${audit.completedAt ? new Date(audit.completedAt).toLocaleDateString() : ''}</div>
        <div>Auditor: ${audit.auditor?.name ?? ''}</div>
      </div>

      ${(audit.items || [])
        .map(
          (item: any) => `
        <div class="item ${item.response === 'YES' ? 'pass' : item.response === 'NO' ? 'fail' : 'na'}">
          <div><strong>${item.title}</strong></div>
          <div>Response: ${item.response || 'Not answered'}</div>
          ${item.notes ? `<div class="notes">Notes: ${item.notes}</div>` : ''}
          ${
            item.action
              ? `<div class="notes">Action: ${item.action.description} (Due: ${item.action.dueDate})</div>`
              : ''
          }
        </div>
      `
        )
        .join('')}

      <div class="signatures">
        ${(audit.signatures || [])
          .map(
            (sig: any) => `
          <div class="signature">
            <div>${sig.name}</div>
            <div class="signature-line"></div>
            <div>${sig.by === 'auditor' ? 'Auditor' : 'Manager'}</div>
          </div>
        `
          )
          .join('')}
      </div>
    </body>
    </html>
  `;

    return {
      statusCode: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="audit-${auditId}.html"`,
      },
      body: html,
    };
  } catch (error) {
    console.error('Export PDF error:', error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
