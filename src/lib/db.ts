import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Audit } from '@/types';

interface AuditDB extends DBSchema {
  drafts: {
    key: string;
    value: Audit;
  };
  mediaQueue: {
    key: string;
    value: {
      id: string;
      auditId: string;
      blob: Blob;
      uploadStatus: 'pending' | 'uploading' | 'uploaded' | 'failed';
    };
  };
  templates: {
    key: string;
    value: any;
  };
}

let db: IDBPDatabase<AuditDB> | undefined;

export const initDB = async () => {
  db = await openDB<AuditDB>('amzl-audit', 1, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('drafts')) {
        database.createObjectStore('drafts', { keyPath: 'auditId' });
      }
      if (!database.objectStoreNames.contains('mediaQueue')) {
        database.createObjectStore('mediaQueue', { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains('templates')) {
        database.createObjectStore('templates', { keyPath: 'templateId' });
      }
    }
  });
  return db;
};

export const auditDB = {
  async saveDraft(audit: Audit) {
    if (!db) await initDB();
    return db!.put('drafts', audit);
  },

  async getDraft(auditId: string) {
    if (!db) await initDB();
    return db!.get('drafts', auditId);
  },

  async getAllDrafts() {
    if (!db) await initDB();
    return db!.getAll('drafts');
  },

  async deleteDraft(auditId: string) {
    if (!db) await initDB();
    return db!.delete('drafts', auditId);
  },

  async queueMedia(auditId: string, blob: Blob) {
    if (!db) await initDB();
    const id = `${auditId}-${Date.now()}-${Math.random()}`;
    await db!.put('mediaQueue', {
      id,
      auditId,
      blob,
      uploadStatus: 'pending'
    });
    return id;
  },

  async getMediaQueue(auditId: string) {
    if (!db) await initDB();
    const all = await db!.getAll('mediaQueue');
    return all.filter((m) => m.auditId === auditId);
  },

  async updateMediaStatus(id: string, status: 'pending' | 'uploading' | 'uploaded' | 'failed') {
    if (!db) await initDB();
    const media = await db!.get('mediaQueue', id);
    if (media) {
      media.uploadStatus = status;
      await db!.put('mediaQueue', media);
    }
  },

  async saveTemplate(template: any) {
    if (!db) await initDB();
    return db!.put('templates', template);
  },

  async getTemplates() {
    if (!db) await initDB();
    return db!.getAll('templates');
  }
};
