import { buildSafetyCultureAuditDraft } from '../data/safetyCultureTemplate';
import { SafetyCultureAudit } from '../types/safetyCulture';

const AUDITS_ENDPOINT = '/.netlify/functions/audits';

async function authenticatedFetch<T>(
  token: string,
  init: RequestInit & { path?: string } = {},
): Promise<T> {
  const { path, ...requestInit } = init;
  const headers = new Headers(requestInit.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path ?? AUDITS_ENDPOINT, {
    ...requestInit,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  const contentType = response.headers.get('content-type');
  if (response.status === 204 || !contentType) {
    return undefined as T;
  }

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export async function listAudits(token: string): Promise<SafetyCultureAudit[]> {
  return authenticatedFetch<SafetyCultureAudit[]>(token, { method: 'GET' });
}

export async function fetchAudit(token: string, id: string): Promise<SafetyCultureAudit> {
  return authenticatedFetch<SafetyCultureAudit>(token, {
    method: 'GET',
    path: `${AUDITS_ENDPOINT}?id=${encodeURIComponent(id)}`,
  });
}

export async function createSafetyCultureAudit(token: string, title?: string): Promise<SafetyCultureAudit> {
  const draft = buildSafetyCultureAuditDraft(title ? { title } : {});
  return authenticatedFetch<SafetyCultureAudit>(token, {
    method: 'POST',
    body: JSON.stringify({ audit: draft }),
  });
}

export async function updateAudit(token: string, audit: SafetyCultureAudit): Promise<SafetyCultureAudit> {
  return authenticatedFetch<SafetyCultureAudit>(token, {
    method: 'PUT',
    body: JSON.stringify({ audit }),
  });
}

export async function deleteAudit(token: string, id: string): Promise<void> {
  await authenticatedFetch(token, {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
}
