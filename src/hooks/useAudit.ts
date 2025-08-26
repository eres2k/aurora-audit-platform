export function useAudit(_auditId?: string) {
  const createAudit = { mutateAsync: async (_data: any) => ({}) };
  const updateAudit = { mutateAsync: async (_data: any) => ({}) };
  return { createAudit, updateAudit, audit: null };
}
