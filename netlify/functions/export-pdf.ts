import type { Handler, HandlerEvent } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { auditId } = JSON.parse(event.body || '{}');
  if (!auditId) {
    return { statusCode: 400, body: 'Audit ID required' };
  }

  const store = getStore('audits');
  const auditData = await store.get(auditId);

  if (!auditData) {
    return { statusCode: 404, body: 'Audit not found' };
  }

  const audit = JSON.parse(auditData);
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
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="audit-${auditId}.html"`
    },
    body: html
  };
};
