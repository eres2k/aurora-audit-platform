import { auth } from './auth';
import type { Audit, Template, Action } from '@/types';

const API_BASE = '/.netlify/functions';

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await auth.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined)
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  async getTemplates(): Promise<Template[]> {
    return this.request<Template[]>('/templates');
  }

  async getTemplate(id: string): Promise<Template> {
    return this.request<Template>(`/templates?id=${id}`);
  }

  async createAudit(audit: Partial<Audit>): Promise<Audit> {
    return this.request<Audit>('/audits', {
      method: 'POST',
      body: JSON.stringify(audit)
    });
  }

  async updateAudit(id: string, audit: Partial<Audit>): Promise<Audit> {
    return this.request<Audit>(`/audits?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(audit)
    });
  }

  async completeAudit(id: string, audit: Audit): Promise<Audit> {
    return this.request<Audit>(`/audits?id=${id}&action=complete`, {
      method: 'POST',
      body: JSON.stringify(audit)
    });
  }

  async getAudits(filters?: {
    siteId?: string;
    from?: string;
    to?: string;
    templateId?: string;
  }): Promise<Audit[]> {
    const params = filters ? new URLSearchParams(filters as Record<string, string>) : null;
    const query = params?.toString();
    return this.request<Audit[]>(`/audits${query ? `?${query}` : ''}`);
  }

  async getAudit(id: string): Promise<Audit> {
    return this.request<Audit>(`/audits?id=${id}`);
  }

  async getUploadUrl(auditId: string): Promise<{ uploadUrl: string; mediaId: string }> {
    return this.request('/media-upload', {
      method: 'POST',
      body: JSON.stringify({ auditId })
    });
  }

  async uploadMedia(uploadUrl: string, blob: Blob): Promise<void> {
    await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': blob.type
      }
    });
  }

  async createAction(action: Partial<Action>): Promise<Action> {
    return this.request<Action>('/actions', {
      method: 'POST',
      body: JSON.stringify(action)
    });
  }

  async getActions(filters?: {
    siteId?: string;
    status?: string;
    assigneeId?: string;
  }): Promise<Action[]> {
    const params = filters ? new URLSearchParams(filters as Record<string, string>) : null;
    const query = params?.toString();
    return this.request<Action[]>(`/actions${query ? `?${query}` : ''}`);
  }

  async exportPdf(auditId: string): Promise<Blob> {
    const token = await auth.getToken();
    const response = await fetch(`${API_BASE}/export-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ auditId })
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    return response.blob();
  }
}

export const api = new ApiClient();
