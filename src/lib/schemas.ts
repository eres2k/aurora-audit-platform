import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.enum(['WHS_ADMIN', 'SITE_MANAGER', 'COORDINATOR', 'VIEWER']),
  siteIds: z.array(z.string()),
});

export const templateSchema = z.object({
  templateId: z.string(),
  title: z.string(),
  siteTypes: z.array(z.string()),
  sections: z.array(z.object({
    title: z.string(),
    items: z.array(z.object({
      id: z.string(),
      type: z.literal('ynna'),
      title: z.string(),
      guidance: z.string().optional(),
    })),
  })),
  scoring: z.object({
    method: z.literal('percent-pass'),
    weights: z.record(z.string(), z.number()).optional(),
  }),
});

export const auditSchema = z.object({
  auditId: z.string(),
  templateId: z.string(),
  siteId: z.string(),
  siteName: z.string(),
  startedAt: z.string(),
  completedAt: z.string().optional(),
  auditor: z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
  }),
  status: z.enum(['DRAFT', 'COMPLETED', 'LOCKED']),
  score: z.object({
    total: z.number(),
    passed: z.number(),
    percent: z.number(),
  }).optional(),
  items: z.array(z.object({
    id: z.string(),
    title: z.string(),
    response: z.enum(['YES', 'NO', 'NA']).optional(),
    notes: z.string().optional(),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    photos: z.array(z.string()).optional(),
    action: z.object({
      actionId: z.string(),
      assignee: z.object({
        id: z.string(),
        name: z.string(),
      }),
      dueDate: z.string(),
      status: z.enum(['OPEN', 'CLOSED']),
    }).optional(),
  })),
  signatures: z.array(z.object({
    by: z.enum(['auditor', 'manager']),
    name: z.string(),
    ts: z.string(),
    data: z.string().optional(),
  })),
  metadata: z.object({
    appVersion: z.string(),
    device: z.string(),
  }),
});

export const actionSchema = z.object({
  actionId: z.string(),
  auditId: z.string(),
  itemId: z.string(),
  siteId: z.string(),
  assignee: z.object({
    id: z.string(),
    name: z.string(),
  }),
  description: z.string(),
  dueDate: z.string(),
  status: z.enum(['OPEN', 'CLOSED']),
});