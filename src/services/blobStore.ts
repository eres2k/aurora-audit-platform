const API_BASE = '/.netlify/functions/blob-store';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  token: string;
  collection: string;
  query?: Record<string, string | undefined>;
  body?: unknown;
}

async function request<T>({ method = 'GET', token, collection, query, body }: RequestOptions): Promise<T> {
  if (!token) {
    throw new Error('A valid Netlify Identity token is required to access blob data.');
  }

  const searchParams = new URLSearchParams({ collection });
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE}?${searchParams.toString()}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface SafetyCultureSection {
  id: string;
  name: string;
  rating: number;
  notes: string;
}

export interface SafetyCultureAudit {
  id: string;
  title: string;
  facility: string;
  status: 'draft' | 'in_progress' | 'completed';
  summary: string;
  sections: SafetyCultureSection[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  ownerEmail?: string;
}

export interface SafetyQuestion {
  id: string;
  prompt: string;
  category: string;
  guidance?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface SafetyTemplate {
  id: string;
  name: string;
  description: string;
  sections: Array<{ id: string; name: string }>;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export async function listAudits(token: string) {
  return request<SafetyCultureAudit[]>({ token, collection: 'audits' });
}

export async function getAudit(token: string, id: string) {
  return request<SafetyCultureAudit>({ token, collection: 'audits', query: { id } });
}

export async function saveAudit(token: string, audit: Partial<SafetyCultureAudit>) {
  return request<SafetyCultureAudit>({
    token,
    collection: 'audits',
    method: 'POST',
    body: audit,
  });
}

export async function deleteAudit(token: string, id: string) {
  return request<void>({ token, collection: 'audits', method: 'DELETE', query: { id } });
}

export async function listQuestions(token: string) {
  return request<SafetyQuestion[]>({ token, collection: 'questions' });
}

export async function saveQuestion(token: string, question: Partial<SafetyQuestion>) {
  return request<SafetyQuestion>({
    token,
    collection: 'questions',
    method: 'POST',
    body: question,
  });
}

export async function deleteQuestion(token: string, id: string) {
  return request<void>({ token, collection: 'questions', method: 'DELETE', query: { id } });
}

export async function listTemplates(token: string) {
  return request<SafetyTemplate[]>({ token, collection: 'templates' });
}

export async function saveTemplate(token: string, template: Partial<SafetyTemplate>) {
  return request<SafetyTemplate>({
    token,
    collection: 'templates',
    method: 'POST',
    body: template,
  });
}

export async function deleteTemplate(token: string, id: string) {
  return request<void>({ token, collection: 'templates', method: 'DELETE', query: { id } });
}

