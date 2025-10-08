export type SafetyCultureResponse =
  | 'meets_expectations'
  | 'needs_improvement'
  | 'not_applicable';

export interface SafetyCultureQuestion {
  id: string;
  prompt: string;
  guidance?: string;
  response: SafetyCultureResponse | null;
  notes: string;
}

export interface SafetyCultureSection {
  id: string;
  title: string;
  description: string;
  questions: SafetyCultureQuestion[];
}

export interface SafetyCultureAudit {
  id: string;
  ownerId: string;
  title: string;
  status: 'draft' | 'in_progress' | 'completed';
  summary?: string;
  createdAt: string;
  updatedAt: string;
  sections: SafetyCultureSection[];
}
