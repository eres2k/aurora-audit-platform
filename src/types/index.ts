export interface User {
  id: string;
  email: string;
  name: string;
  role: 'WHS_ADMIN' | 'SITE_MANAGER' | 'COORDINATOR' | 'VIEWER';
  siteIds: string[];
  app_metadata?: {
    role?: string;
  };
  user_metadata?: {
    site_ids?: string[];
    name?: string;
  };
}

export interface Template {
  templateId: string;
  title: string;
  siteTypes: string[];
  sections: TemplateSection[];
  scoring: {
    method: 'percent-pass';
    weights?: Record<string, number>;
  };
}

export interface TemplateSection {
  title: string;
  items: TemplateItem[];
}

export interface TemplateItem {
  id: string;
  type: 'ynna';
  title: string;
  guidance?: string;
}

export interface Audit {
  auditId: string;
  templateId: string;
  siteId: string;
  siteName: string;
  startedAt: string;
  completedAt?: string;
  auditor: {
    id: string;
    name: string;
    role: string;
  };
  status: 'DRAFT' | 'COMPLETED' | 'LOCKED';
  score?: {
    total: number;
    passed: number;
    percent: number;
  };
  items: AuditItem[];
  signatures: Signature[];
  metadata: {
    appVersion: string;
    device: string;
  };
}

export interface AuditItem {
  id: string;
  title: string;
  response?: 'YES' | 'NO' | 'NA';
  notes?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  photos?: string[];
  action?: {
    actionId: string;
    assignee: {
      id: string;
      name: string;
    };
    dueDate: string;
    status: 'OPEN' | 'CLOSED';
  };
}

export interface Signature {
  by: 'auditor' | 'manager';
  name: string;
  ts: string;
  data?: string;
}

export interface Action {
  actionId: string;
  auditId: string;
  itemId: string;
  siteId: string;
  assignee: {
    id: string;
    name: string;
  };
  description: string;
  dueDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}
