import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
} as const;

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const user = context.clientContext?.user;
    if (!user?.sub) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const store = getStore('audits');
    const params = event.queryStringParameters || {};

    if (event.httpMethod === 'POST' && params.action === 'complete' && params.id) {
      const auditId = params.id;
      const auditData = JSON.parse(event.body || '{}');

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

      try {
        await store.setJSON(blobPath, completedAudit);

        const indexPath = `_index/${completedAudit.siteId}/${year}-${month}.json`;
        const monthIndex = ((await store.getJSON(indexPath)) as { audits: Array<Record<string, unknown>> }) ?? {
          audits: [],
        };

        if (!monthIndex.audits.some((a) => a.auditId === auditId)) {
          monthIndex.audits.push({
            auditId,
            completedAt: completedAudit.completedAt,
            templateId: completedAudit.templateId,
            score: completedAudit.score,
            auditorName: (completedAudit as any)?.auditor?.name ?? user.email,
          });
          await store.setJSON(indexPath, monthIndex);
        }

        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            auditId,
            path: blobPath,
            message: 'Audit completed successfully',
          }),
        };
      } catch (blobError) {
        console.error('Blob storage error:', blobError);
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            error: 'Failed to store audit',
            details: blobError instanceof Error ? blobError.message : 'Unknown blob error',
          }),
        };
      }
    }

    if (event.httpMethod === 'GET') {
      const siteId = params.siteId;
      if (!siteId) {
        return {
          statusCode: 400,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'siteId parameter required' }),
        };
      }

      const audits: Array<Record<string, unknown>> = [];
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

      try {
        const indexPath = `_index/${siteId}/${currentYear}-${currentMonth}.json`;
        const monthIndex = (await store.getJSON(indexPath)) as { audits?: Array<Record<string, unknown>> } | null;
        if (monthIndex?.audits) {
          audits.push(...monthIndex.audits);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('No audits found for current month/site', { siteId, error });
        }
      }

      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify({ audits }),
      };
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
