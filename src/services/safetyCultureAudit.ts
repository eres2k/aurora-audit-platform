import netlifyIdentity from 'netlify-identity-widget';

export interface SafetyCultureSection {
  id: string;
  title: string;
  rating: number | null;
  notes: string;
}

export interface SafetyCultureAuditData {
  facilityName: string;
  auditorName: string;
  auditDate: string;
  overallObservations: string;
  immediateActions: string;
  sections: SafetyCultureSection[];
  updatedAt?: string;
}

export const defaultSafetyCultureAudit: SafetyCultureAuditData = {
  facilityName: '',
  auditorName: '',
  auditDate: new Date().toISOString().slice(0, 10),
  overallObservations: '',
  immediateActions: '',
  sections: [
    { id: 'leadership', title: 'Leadership Commitment', rating: null, notes: '' },
    { id: 'communication', title: 'Communication & Feedback', rating: null, notes: '' },
    { id: 'reporting', title: 'Incident & Near-Miss Reporting', rating: null, notes: '' },
    { id: 'learning', title: 'Learning & Improvement', rating: null, notes: '' },
    { id: 'engagement', title: 'Employee Engagement', rating: null, notes: '' },
  ],
};

export function createEmptySafetyCultureAudit(): SafetyCultureAuditData {
  return {
    ...defaultSafetyCultureAudit,
    sections: defaultSafetyCultureAudit.sections.map((section) => ({ ...section })),
  };
}

async function authorizedFetch(input: RequestInfo, init: RequestInit = {}) {
  const user = netlifyIdentity.currentUser();
  if (!user) {
    throw new Error('User must be authenticated to access Safety Culture audits.');
  }

  const token = await user.jwt();

  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }

  return response.json();
}

export async function fetchSafetyCultureAudit(): Promise<SafetyCultureAuditData | null> {
  return authorizedFetch('/.netlify/functions/safety-culture-audit');
}

export async function saveSafetyCultureAudit(data: SafetyCultureAuditData): Promise<SafetyCultureAuditData> {
  return authorizedFetch('/.netlify/functions/safety-culture-audit', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

