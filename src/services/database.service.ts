import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const DatabaseService = {
  // Audit Operations
  async createAudit(audit: AuditData) {
    const { data, error } = await supabase
      .from('audits')
      .insert(audit)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAudits(filters?: AuditFilters) {
    let query = supabase.from('audits').select('*');
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Question Operations
  async importQuestions(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/.netlify/functions/import-questions', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Import failed');
    return response.json();
  },

  // Real-time subscriptions
  subscribeToAudit(auditId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`audit:${auditId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'audits', filter: `id=eq.${auditId}` },
        callback
      )
      .subscribe();
  },
};
