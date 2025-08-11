// Database Service for Aurora Audit Platform
// Supports both Supabase and Firebase

import { createClient } from '@supabase/supabase-js';
import localforage from 'localforage';

// Initialize Supabase client if configured
let supabase = null;
if (process.env.REACT_APP_SUPABASE_URL && process.env.REACT_APP_SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
  );
}

// Configure offline storage
const offlineStore = localforage.createInstance({
  name: 'aurora-audit-offline',
  storeName: 'audits'
});

// Database service class
class DatabaseService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Generic error handler
  handleError(error, context) {
    console.error(`[Database Error - ${context}]:`, error);
    throw new Error(`Database operation failed: ${context}`);
  }

  // Check if using Supabase
  isSupabaseEnabled() {
    return supabase !== null;
  }

  // ==================== AUDIT METHODS ====================

  async getAudits(filters = {}) {
    try {
      if (!this.isOnline) {
        return await this.getOfflineAudits();
      }

      if (!this.isSupabaseEnabled()) {
        return await this.getMockAudits();
      }

      let query = supabase.from('audits').select('*');

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }
      if (filters.department) {
        query = query.eq('department', filters.department);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (filters.page && filters.pageSize) {
        const start = (filters.page - 1) * filters.pageSize;
        const end = start + filters.pageSize - 1;
        query = query.range(start, end);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Cache for offline use
      await this.cacheAudits(data);

      return data;
    } catch (error) {
      this.handleError(error, 'getAudits');
    }
  }

  async getAudit(id) {
    try {
      if (!this.isOnline) {
        return await offlineStore.getItem(`audit_${id}`);
      }

      if (!this.isSupabaseEnabled()) {
        return this.getMockAudit(id);
      }

      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Cache for offline use
      await offlineStore.setItem(`audit_${id}`, data);

      return data;
    } catch (error) {
      this.handleError(error, 'getAudit');
    }
  }

  async createAudit(audit) {
    try {
      const auditData = {
        ...audit,
        id: this.generateId(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (!this.isOnline) {
        await this.queueForSync('create', 'audits', auditData);
        await offlineStore.setItem(`audit_${auditData.id}`, auditData);
        return auditData;
      }

      if (!this.isSupabaseEnabled()) {
        return auditData;
      }

      const { data, error } = await supabase
        .from('audits')
        .insert([auditData])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'createAudit');
    }
  }

  async updateAudit(id, updates) {
    try {
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      if (!this.isOnline) {
        await this.queueForSync('update', 'audits', { id, ...updateData });
        const existing = await offlineStore.getItem(`audit_${id}`);
        const updated = { ...existing, ...updateData };
        await offlineStore.setItem(`audit_${id}`, updated);
        return updated;
      }

      if (!this.isSupabaseEnabled()) {
        return { id, ...updateData };
      }

      const { data, error } = await supabase
        .from('audits')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update cache
      await offlineStore.setItem(`audit_${id}`, data);

      return data;
    } catch (error) {
      this.handleError(error, 'updateAudit');
    }
  }

  async deleteAudit(id) {
    try {
      if (!this.isOnline) {
        await this.queueForSync('delete', 'audits', { id });
        await offlineStore.removeItem(`audit_${id}`);
        return { success: true };
      }

      if (!this.isSupabaseEnabled()) {
        return { success: true };
      }

      const { error } = await supabase
        .from('audits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from cache
      await offlineStore.removeItem(`audit_${id}`);

      return { success: true };
    } catch (error) {
      this.handleError(error, 'deleteAudit');
    }
  }

  // ==================== QUESTION METHODS ====================

  async getQuestions(filters = {}) {
    try {
      if (!this.isSupabaseEnabled()) {
        return this.getMockQuestions();
      }

      let query = supabase.from('questions').select('*');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.active !== undefined) {
        query = query.eq('active', filters.active);
      }

      query = query.order('order_index', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'getQuestions');
    }
  }

  async createQuestion(question) {
    try {
      if (!this.isSupabaseEnabled()) {
        return { id: this.generateId(), ...question };
      }

      const { data, error } = await supabase
        .from('questions')
        .insert([question])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'createQuestion');
    }
  }

  async updateQuestion(id, updates) {
    try {
      if (!this.isSupabaseEnabled()) {
        return { id, ...updates };
      }

      const { data, error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'updateQuestion');
    }
  }

  async deleteQuestion(id) {
    try {
      if (!this.isSupabaseEnabled()) {
        return { success: true };
      }

      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      this.handleError(error, 'deleteQuestion');
    }
  }

  // ==================== TEMPLATE METHODS ====================

  async getTemplates() {
    try {
      if (!this.isSupabaseEnabled()) {
        return this.getMockTemplates();
      }

      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('name');

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'getTemplates');
    }
  }

  async createTemplate(template) {
    try {
      if (!this.isSupabaseEnabled()) {
        return { id: this.generateId(), ...template };
      }

      const { data, error } = await supabase
        .from('templates')
        .insert([template])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'createTemplate');
    }
  }

  // ==================== RESPONSE METHODS ====================

  async saveResponse(response) {
    try {
      const responseData = {
        ...response,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (!this.isOnline) {
        await this.queueForSync('create', 'responses', responseData);
        return responseData;
      }

      if (!this.isSupabaseEnabled()) {
        return responseData;
      }

      const { data, error } = await supabase
        .from('responses')
        .upsert([responseData])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'saveResponse');
    }
  }

  async getResponses(auditId) {
    try {
      if (!this.isSupabaseEnabled()) {
        return [];
      }

      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('audit_id', auditId);

      if (error) throw error;

      return data;
    } catch (error) {
      this.handleError(error, 'getResponses');
    }
  }

  // ==================== FILE UPLOAD METHODS ====================

  async uploadFile(file, path) {
    try {
      if (!this.isSupabaseEnabled()) {
        // Return mock URL for development
        return URL.createObjectURL(file);
      }

      const fileName = `${Date.now()}_${file.name}`;
      const fullPath = `${path}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('audit-attachments')
        .upload(fullPath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('audit-attachments')
        .getPublicUrl(fullPath);

      return publicUrl;
    } catch (error) {
      this.handleError(error, 'uploadFile');
    }
  }

  async deleteFile(path) {
    try {
      if (!this.isSupabaseEnabled()) {
        return { success: true };
      }

      const { error } = await supabase.storage
        .from('audit-attachments')
        .remove([path]);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      this.handleError(error, 'deleteFile');
    }
  }

  // ==================== OFFLINE SYNC METHODS ====================

  async queueForSync(action, table, data) {
    const syncItem = {
      id: this.generateId(),
      action,
      table,
      data,
      timestamp: new Date().toISOString()
    };

    this.syncQueue.push(syncItem);
    await offlineStore.setItem('sync_queue', this.syncQueue);

    // Register for background sync if available
    if ('serviceWorker' in navigator && 'sync' in self.registration) {
      await self.registration.sync.register('sync-audits');
    }
  }

  async syncOfflineData() {
    try {
      const queue = await offlineStore.getItem('sync_queue') || [];
      
      for (const item of queue) {
        try {
          switch (item.action) {
            case 'create':
              await this[`create${this.capitalize(item.table.slice(0, -1))}`](item.data);
              break;
            case 'update':
              await this[`update${this.capitalize(item.table.slice(0, -1))}`](item.data.id, item.data);
              break;
            case 'delete':
              await this[`delete${this.capitalize(item.table.slice(0, -1))}`](item.data.id);
              break;
            default:
              console.warn('Unknown sync action:', item.action);
          }
        } catch (error) {
          console.error('Failed to sync item:', item, error);
        }
      }

      // Clear the queue after successful sync
      await offlineStore.removeItem('sync_queue');
      this.syncQueue = [];
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  async cacheAudits(audits) {
    for (const audit of audits) {
      await offlineStore.setItem(`audit_${audit.id}`, audit);
    }
  }

  async getOfflineAudits() {
    const keys = await offlineStore.keys();
    const auditKeys = keys.filter(key => key.startsWith('audit_'));
    const audits = await Promise.all(
      auditKeys.map(key => offlineStore.getItem(key))
    );
    return audits.filter(Boolean);
  }

  // ==================== UTILITY METHODS ====================

  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // ==================== MOCK DATA METHODS ====================

  getMockAudits() {
    return [
      {
        id: '1',
        title: 'Q1 2025 Safety Audit',
        description: 'Quarterly safety inspection',
        status: 'in_progress',
        progress: 65,
        assignedTo: 'John Doe',
        department: 'Operations',
        location: 'Main Facility',
        priority: 'high',
        questionsCompleted: 13,
        totalQuestions: 20,
        dueDate: '2025-03-31',
        createdAt: '2025-01-15',
        updatedAt: '2025-08-10'
      },
      {
        id: '2',
        title: 'Annual Compliance Review',
        description: 'Yearly compliance check',
        status: 'completed',
        progress: 100,
        assignedTo: 'Jane Smith',
        department: 'Legal',
        location: 'Corporate Office',
        priority: 'medium',
        questionsCompleted: 50,
        totalQuestions: 50,
        dueDate: '2025-02-28',
        createdAt: '2025-01-01',
        updatedAt: '2025-02-25'
      }
    ];
  }

  getMockAudit(id) {
    const audits = this.getMockAudits();
    return audits.find(audit => audit.id === id);
  }

  getMockQuestions() {
    return [
      { id: '1', text: 'Are all emergency exits clearly marked?', type: 'boolean', category: 'Safety', required: true },
      { id: '2', text: 'Number of fire extinguishers on floor', type: 'number', category: 'Safety', required: true },
      { id: '3', text: 'Last inspection date', type: 'date', category: 'Compliance', required: true },
      { id: '4', text: 'Inspector comments', type: 'text', category: 'General', required: false },
      { id: '5', text: 'Upload photos of issues', type: 'file', category: 'Documentation', required: false }
    ];
  }

  getMockTemplates() {
    return [
      { id: '1', name: 'Safety Inspection', description: 'Standard safety audit template', questionCount: 25 },
      { id: '2', name: 'Quality Control', description: 'Product quality assessment', questionCount: 30 },
      { id: '3', name: 'Compliance Review', description: 'Regulatory compliance check', questionCount: 40 }
    ];
  }
}

// Export singleton instance
const databaseService = new DatabaseService();
export default databaseService;