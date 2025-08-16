import { createClient } from '@supabase/supabase-js';
import Dexie from 'dexie';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const db = new Dexie('AuroraDB');
db.version(1).stores({
  audits: 'id, title, status',
  questions: 'id, text, type',
  templates: 'id, name',
  responses: 'id, auditId, questionId',
});

export const getAudits = async () => {
  if (navigator.onLine) {
    const { data } = await supabase.from('audits').select('*');
    await db.audits.bulkPut(data);
    return data;
  }
  return await db.audits.toArray();
};

export const createAudit = async (audit) => {
  const auditData = { ...audit, createdAt: new Date().toISOString() };
  if (navigator.onLine) {
    const { data } = await supabase.from('audits').insert(auditData).select();
    await db.audits.add(data[0]);
    return data[0];
  }
  await db.audits.add({ ...auditData, isSynced: false });
  self.registration.sync.register('sync-audits');
  return auditData;
};

// Similar for updateAudit, deleteAudit, questions, templates
