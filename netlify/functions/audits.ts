import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { getUser, requireAuth, canAccessSite, CORS_HEADERS } from './auth.js';
import { randomUUID } from 'crypto';

export const handler: Handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  try {
    const user = requireAuth(getUser(context));
    const userRole = user.app_metadata?.role || 'VIEWER';

    const store = getStore('audits');
    const params = event.queryStringParameters || {};

    if (event.httpMethod === 'POST' && !params.action) {
      // Create or update draft
      const auditData = JSON.parse(event.body || '{}');
      const auditId = params.id || randomUUID();

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

      if (!canAccessSite(user, auditData.siteId)) {
        return {
          statusCode: 403,
          headers: CORS_HEADERS,
          body: JSON.stringify({ error: 'Access denied to site' }),
        };
      }

      const draftAudit = {
        ...auditData,
        auditId,
        status: 'DRAFT',
        startedAt: auditData.startedAt || new Date().toISOString(),
        auditor: {
          id: user.sub,
          name: user.user_metadata?.name || user.email,
          role: userRole,
        },
      };

      // For drafts, store in a drafts namespace or use a temp path
      const draftPath = `drafts/${auditId}.json`;

      try {
        await store.setJSON(draftPath, draftAudit);
        return {
          statusCode: 200,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            success: true,
            audit: draftAudit,
          }),
        };
      } catch (blobError) {
        console.error('Blob storage error:', blobError);
        return {
          statusCode: 500,
          headers: CORS_HEADERS,
          body: JSON.stringify({
            error: 'Failed to save draft',
            details: blobError instanceof Error ? blobError.message : 'Unknown blob error',
          }),
        };
      }
    }

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
        await store.setJSON(blobPath, completedAudit);
        console.log('Stored audit successfully');

        const indexPath = `_index/${completedAudit.siteId}/${year}-${month}.json`;
        let monthIndex: { audits: Array<Record<string, unknown>> };
        try {
          const indexData = await store.get(indexPath);
          monthIndex = indexData ? JSON.parse(indexData as string) : { audits: [] };
        } catch {
          monthIndex = { audits: [] };
        }

        if (!monthIndex.audits.some((a) => a.auditId === auditId)) {
          monthIndex.audits.push({
            auditId,
            completedAt: completedAudit.completedAt,
            templateId: completedAudit.templateId,
            score: completedAudit.score,
            auditorName: (completedAudit as any)?.auditor?.name ?? user.email,
          });
          await store.setJSON(indexPath, monthIndex);
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
            path: blobPath,
            message: 'Audit completed successfully',
          }),
        };
      } catch (blobError) {
        console.error('Blob storage error:', blobError, { blobPath, auditId, siteId: completedAudit.siteId });
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
          // Search in recent months
          const currentDate = new Date();
          for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const auditPath = `${siteId}/${year}/${month}/${auditId}.json`;
            try {
              const auditData = await store.get(auditPath);
              if (auditData) {
                const audit = JSON.parse(auditData as string);
                return {
                  statusCode: 200,
                  headers: CORS_HEADERS,
                  body: JSON.stringify(audit),
                };
              }
            } catch {}
          }
          return {
            statusCode: 404,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Audit not found' }),
          };
        } catch (error) {
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

        const audits: Array<Record<string, unknown>> = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');

        try {
          const indexPath = `_index/${siteId}/${currentYear}-${currentMonth}.json`;
          const indexData = await store.get(indexPath);
          const monthIndex = indexData ? JSON.parse(indexData as string) : null;
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
