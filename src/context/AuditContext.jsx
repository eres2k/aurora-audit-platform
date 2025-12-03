import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { auditsApi, templatesApi, actionsApi } from '../utils/api';

const AuditContext = createContext();

// Initialize localforage stores (for offline cache)
const auditsStore = localforage.createInstance({ name: 'audits' });
const templatesStore = localforage.createInstance({ name: 'templates' });
const actionsStore = localforage.createInstance({ name: 'actions' });

// Default templates for Amazon Logistics
const DEFAULT_TEMPLATES = [
  {
    id: 'tpl-vehicle-safety',
    title: 'Vehicle Safety Inspection',
    description: 'Complete vehicle safety check for delivery vans',
    category: 'Safety',
    icon: 'truck',
    color: '#FF9900',
    estimatedTime: 15,
    isDefault: true,
    sections: [
      {
        id: 'sec-exterior',
        title: 'Exterior Inspection',
        items: [
          { id: 'q1', text: 'Are all lights functioning properly?', type: 'bool', required: true, critical: true },
          { id: 'q2', text: 'Are mirrors clean and properly adjusted?', type: 'bool', required: true },
          { id: 'q3', text: 'Tire condition and pressure adequate?', type: 'bool', required: true },
          { id: 'q4', text: 'Any visible body damage?', type: 'bool', required: true },
        ],
      },
      {
        id: 'sec-interior',
        title: 'Interior Inspection',
        items: [
          { id: 'q5', text: 'Is the cabin clean?', type: 'bool', required: true },
          { id: 'q6', text: 'Seatbelt in good condition?', type: 'bool', required: true, critical: true },
          { id: 'q7', text: 'Dashboard warning lights clear?', type: 'bool', required: true },
          { id: 'q8', text: 'Additional notes', type: 'text', required: false },
        ],
      },
      {
        id: 'sec-safety',
        title: 'Safety Equipment',
        items: [
          { id: 'q9', text: 'Fire extinguisher present and charged?', type: 'bool', required: true, critical: true },
          { id: 'q10', text: 'First aid kit present and stocked?', type: 'bool', required: true },
          { id: 'q11', text: 'Reflective triangles/vests available?', type: 'bool', required: true },
        ],
      },
    ],
  },
  {
    id: 'tpl-warehouse-safety',
    title: 'Warehouse Safety Audit',
    description: 'Comprehensive warehouse safety and compliance check',
    category: 'Compliance',
    icon: 'warehouse',
    color: '#007185',
    estimatedTime: 45,
    isDefault: true,
    sections: [
      {
        id: 'sec-general',
        title: 'General Safety',
        items: [
          { id: 'w1', text: 'Emergency exits clearly marked?', type: 'bool', required: true, critical: true },
          { id: 'w2', text: 'Fire extinguishers accessible?', type: 'bool', required: true, critical: true },
          { id: 'w3', text: 'Aisle clearance maintained?', type: 'bool', required: true },
          { id: 'w4', text: 'Floor condition safe (no spills/debris)?', type: 'bool', required: true },
        ],
      },
      {
        id: 'sec-equipment',
        title: 'Equipment Safety',
        items: [
          { id: 'w5', text: 'Forklifts inspected today?', type: 'bool', required: true },
          { id: 'w6', text: 'Pallet jacks in good condition?', type: 'bool', required: true },
          { id: 'w7', text: 'Conveyor guards in place?', type: 'bool', required: true, critical: true },
          { id: 'w8', text: 'Equipment notes', type: 'text', required: false },
        ],
      },
      {
        id: 'sec-ppe',
        title: 'PPE Compliance',
        items: [
          { id: 'w9', text: 'All workers wearing safety shoes?', type: 'bool', required: true },
          { id: 'w10', text: 'High-visibility vests worn in required areas?', type: 'bool', required: true },
          { id: 'w11', text: 'Hearing protection used where required?', type: 'bool', required: true },
        ],
      },
    ],
  },
  {
    id: 'tpl-delivery-quality',
    title: 'Delivery Quality Check',
    description: 'Package handling and delivery quality assessment',
    category: 'Quality',
    icon: 'package',
    color: '#067D62',
    estimatedTime: 10,
    isDefault: true,
    sections: [
      {
        id: 'sec-package',
        title: 'Package Condition',
        items: [
          { id: 'd1', text: 'Package intact and undamaged?', type: 'bool', required: true },
          { id: 'd2', text: 'Label readable and correct?', type: 'bool', required: true },
          { id: 'd3', text: 'Correct address verified?', type: 'bool', required: true },
        ],
      },
      {
        id: 'sec-delivery',
        title: 'Delivery Process',
        items: [
          { id: 'd4', text: 'Customer present for delivery?', type: 'bool', required: true },
          { id: 'd5', text: 'Safe location for package?', type: 'bool', required: true },
          { id: 'd6', text: 'Delivery photo taken?', type: 'bool', required: true },
          { id: 'd7', text: 'Delivery notes', type: 'text', required: false },
        ],
      },
    ],
  },
  {
    id: 'tpl-5s-audit',
    title: '5S Workplace Audit',
    description: 'Sort, Set, Shine, Standardize, Sustain workplace check',
    category: 'Operations',
    icon: 'sparkles',
    color: '#6366F1',
    estimatedTime: 20,
    isDefault: true,
    sections: [
      {
        id: 'sec-sort',
        title: 'Sort (Seiri)',
        items: [
          { id: '5s1', text: 'Unnecessary items removed from workspace?', type: 'bool', required: true },
          { id: '5s2', text: 'Red-tagged items processed within timeframe?', type: 'bool', required: true },
        ],
      },
      {
        id: 'sec-set',
        title: 'Set in Order (Seiton)',
        items: [
          { id: '5s3', text: 'Tools and materials have designated places?', type: 'bool', required: true },
          { id: '5s4', text: 'Labels and markings visible and clear?', type: 'bool', required: true },
        ],
      },
      {
        id: 'sec-shine',
        title: 'Shine (Seiso)',
        items: [
          { id: '5s5', text: 'Work area clean and free of debris?', type: 'bool', required: true },
          { id: '5s6', text: 'Cleaning schedule being followed?', type: 'bool', required: true },
        ],
      },
      {
        id: 'sec-standardize',
        title: 'Standardize (Seiketsu)',
        items: [
          { id: '5s7', text: 'Visual standards posted and followed?', type: 'bool', required: true },
          { id: '5s8', text: 'Standard work procedures displayed?', type: 'bool', required: true },
        ],
      },
      {
        id: 'sec-sustain',
        title: 'Sustain (Shitsuke)',
        items: [
          { id: '5s9', text: 'Regular audits being conducted?', type: 'bool', required: true },
          { id: '5s10', text: 'Continuous improvement suggestions implemented?', type: 'bool', required: true },
        ],
      },
    ],
  },
];

export function AuditProvider({ children }) {
  const { user, selectedStation } = useAuth();
  const [audits, setAudits] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, synced, error

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data on mount or user change
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  // Sync when coming back online
  useEffect(() => {
    if (isOnline && user) {
      syncWithServer();
    }
  }, [isOnline, user]);

  // Load data from server (primary) and local storage (fallback/cache)
  const loadData = async () => {
    setLoading(true);
    setSyncStatus('syncing');

    try {
      // Try to load from server first
      if (isOnline && user) {
        await loadFromServer();
        setSyncStatus('synced');
      } else {
        // Fallback to local storage when offline
        await loadFromLocalStorage();
        setSyncStatus('idle');
      }
    } catch (error) {
      console.error('Error loading data from server, falling back to local:', error);
      // Fallback to local storage on server error
      await loadFromLocalStorage();
      setSyncStatus('error');
    }

    setLoading(false);
  };

  // Load data from server
  const loadFromServer = async () => {
    try {
      // Load audits from server
      const auditsResponse = await auditsApi.getAll();
      const serverAudits = auditsResponse.audits || [];
      setAudits(serverAudits);
      await auditsStore.setItem('audits', serverAudits);

      // Load custom templates from server
      const templatesResponse = await templatesApi.getAll();
      const serverTemplates = templatesResponse.templates || [];

      // Merge with default templates
      const mergedTemplates = [...DEFAULT_TEMPLATES];
      serverTemplates.forEach(t => {
        if (!mergedTemplates.find(dt => dt.id === t.id)) {
          mergedTemplates.push(t);
        }
      });
      setTemplates(mergedTemplates);
      await templatesStore.setItem('templates', serverTemplates);

      // Load actions from server
      const actionsResponse = await actionsApi.getAll();
      const serverActions = actionsResponse.actions || [];
      setActions(serverActions);
      await actionsStore.setItem('actions', serverActions);

      console.log('Data loaded from server successfully');
    } catch (error) {
      console.error('Error loading from server:', error);
      throw error;
    }
  };

  // Load data from local storage
  const loadFromLocalStorage = async () => {
    try {
      // Load audits
      const savedAudits = await auditsStore.getItem('audits') || [];
      setAudits(savedAudits);

      // Load templates (merge defaults with custom)
      const savedTemplates = await templatesStore.getItem('templates') || [];
      const mergedTemplates = [...DEFAULT_TEMPLATES];
      savedTemplates.forEach(t => {
        if (!mergedTemplates.find(dt => dt.id === t.id)) {
          mergedTemplates.push(t);
        }
      });
      setTemplates(mergedTemplates);

      // Load actions
      const savedActions = await actionsStore.getItem('actions') || [];
      setActions(savedActions);

      console.log('Data loaded from local storage');
    } catch (error) {
      console.error('Error loading from local storage:', error);
    }
  };

  // Sync local data with server
  const syncWithServer = async () => {
    if (!isOnline || !user) return;

    setSyncStatus('syncing');
    try {
      // Get local data
      const localAudits = await auditsStore.getItem('audits') || [];
      const localTemplates = await templatesStore.getItem('templates') || [];
      const localActions = await actionsStore.getItem('actions') || [];

      // Sync audits to server
      for (const audit of localAudits) {
        try {
          await auditsApi.update(audit.id, audit);
        } catch (error) {
          console.error('Error syncing audit:', audit.id, error);
        }
      }

      // Sync custom templates to server
      for (const template of localTemplates) {
        if (!template.isDefault) {
          try {
            await templatesApi.update(template.id, template);
          } catch (error) {
            console.error('Error syncing template:', template.id, error);
          }
        }
      }

      // Sync actions to server
      for (const action of localActions) {
        try {
          await actionsApi.update(action.id, action);
        } catch (error) {
          console.error('Error syncing action:', action.id, error);
        }
      }

      // Reload from server to get merged data
      await loadFromServer();
      setSyncStatus('synced');
    } catch (error) {
      console.error('Error syncing with server:', error);
      setSyncStatus('error');
    }
  };

  // Save audits to both local storage and server
  const saveAudits = async (newAudits) => {
    // Update local state immediately
    setAudits(newAudits);

    // Save to local storage (always, for offline support)
    await auditsStore.setItem('audits', newAudits);
  };

  // Save templates to both local storage and server
  const saveTemplates = async (newTemplates) => {
    // Update local state immediately
    setTemplates(newTemplates);

    // Save custom templates to local storage (exclude defaults)
    const customTemplates = newTemplates.filter(t => !t.isDefault);
    await templatesStore.setItem('templates', customTemplates);
  };

  // Save actions to both local storage and server
  const saveActions = async (newActions) => {
    // Update local state immediately
    setActions(newActions);

    // Save to local storage
    await actionsStore.setItem('actions', newActions);
  };

  // Create new audit
  const createAudit = async (templateId, stationOverride = null) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) throw new Error('Template not found');

    const newAudit = {
      id: `audit-${uuidv4()}`,
      templateId,
      templateTitle: template.title,
      status: 'draft',
      date: new Date().toISOString(),
      createdBy: user?.email || 'Anonymous',
      location: stationOverride || selectedStation,
      score: null,
      answers: {},
      notes: {},
      questionPhotos: {}, // Photos per question: { questionId: [photoDataUrl, ...] }
      globalNotes: '',
      photos: [],
      signature: null,
    };

    const updated = [...audits, newAudit];
    await saveAudits(updated);

    // Sync to server if online
    if (isOnline && user) {
      try {
        await auditsApi.create(newAudit);
      } catch (error) {
        console.error('Error saving audit to server:', error);
      }
    }

    return newAudit;
  };

  // Update audit
  const updateAudit = async (auditId, updates) => {
    const updated = audits.map(a =>
      a.id === auditId ? { ...a, ...updates } : a
    );
    await saveAudits(updated);

    // Sync to server if online
    if (isOnline && user) {
      try {
        await auditsApi.update(auditId, updates);
      } catch (error) {
        console.error('Error updating audit on server:', error);
      }
    }
  };

  // Complete audit
  const completeAudit = async (auditId, finalData) => {
    const audit = audits.find(a => a.id === auditId);
    if (!audit) throw new Error('Audit not found');

    const template = templates.find(t => t.id === audit.templateId);
    const score = calculateScore(template, finalData.answers);

    const completedAudit = {
      ...audit,
      ...finalData,
      status: 'completed',
      score,
      completedAt: new Date().toISOString(),
    };

    const updated = audits.map(a =>
      a.id === auditId ? completedAudit : a
    );
    await saveAudits(updated);

    // Create actions for failed items
    const newActions = [];
    if (template) {
      template.sections.forEach(section => {
        section.items.forEach(item => {
          if (finalData.answers[item.id] === 'fail') {
            newActions.push({
              id: `action-${uuidv4()}`,
              auditId,
              questionId: item.id,
              questionText: item.text,
              priority: item.critical ? 'high' : 'medium',
              status: 'open',
              createdAt: new Date().toISOString(),
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              assignee: null,
              owner: null, // Can be assigned later: OPS, ACES, RME, WHS
              notes: finalData.notes?.[item.id] || '',
              location: selectedStation,
            });
          }
        });
      });
    }

    if (newActions.length > 0) {
      const updatedActions = [...actions, ...newActions];
      await saveActions(updatedActions);

      // Sync new actions to server
      if (isOnline && user) {
        try {
          await actionsApi.createBulk(newActions);
        } catch (error) {
          console.error('Error saving actions to server:', error);
        }
      }
    }

    // Sync completed audit to server
    if (isOnline && user) {
      try {
        await auditsApi.update(auditId, completedAudit);
      } catch (error) {
        console.error('Error completing audit on server:', error);
      }
    }

    return score;
  };

  // Delete audit
  const deleteAudit = async (auditId) => {
    const updated = audits.filter(a => a.id !== auditId);
    await saveAudits(updated);

    // Sync to server if online
    if (isOnline && user) {
      try {
        await auditsApi.delete(auditId);
      } catch (error) {
        console.error('Error deleting audit from server:', error);
      }
    }
  };

  // Calculate score
  const calculateScore = (template, answers) => {
    if (!template || !answers) return 0;

    let totalQuestions = 0;
    let passedQuestions = 0;
    let naQuestions = 0;

    template.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.type === 'bool') {
          totalQuestions++;
          if (answers[item.id] === 'pass') passedQuestions++;
          if (answers[item.id] === 'na') naQuestions++;
        }
      });
    });

    const scorableQuestions = totalQuestions - naQuestions;
    if (scorableQuestions === 0) return 100;

    return Math.round((passedQuestions / scorableQuestions) * 100);
  };

  // Update action
  const updateAction = async (actionId, updates) => {
    const updatedAction = {
      ...actions.find(a => a.id === actionId),
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const updated = actions.map(a =>
      a.id === actionId ? updatedAction : a
    );
    await saveActions(updated);

    // Sync to server if online
    if (isOnline && user) {
      try {
        await actionsApi.update(actionId, updatedAction);
      } catch (error) {
        console.error('Error updating action on server:', error);
      }
    }
  };

  // Create action manually (during audit)
  const createAction = async (actionData) => {
    const newAction = {
      id: `action-${uuidv4()}`,
      auditId: actionData.auditId || null,
      questionId: actionData.questionId || null,
      questionText: actionData.questionText || actionData.title || 'Manual Action',
      title: actionData.title || actionData.questionText || 'Manual Action',
      description: actionData.description || actionData.notes || '',
      priority: actionData.priority || 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: actionData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      assignee: actionData.assignee || null,
      owner: actionData.owner || null, // Owner team: OPS, ACES, RME, WHS
      notes: actionData.notes || actionData.description || '',
      location: actionData.location || selectedStation,
      isManual: true, // Flag to indicate this was manually created
    };

    const updatedActions = [...actions, newAction];
    await saveActions(updatedActions);

    // Sync to server if online
    if (isOnline && user) {
      try {
        await actionsApi.create(newAction);
      } catch (error) {
        console.error('Error saving action to server:', error);
      }
    }

    return newAction;
  };

  // Delete action
  const deleteAction = async (actionId) => {
    const updated = actions.filter(a => a.id !== actionId);
    await saveActions(updated);

    // Sync to server if online
    if (isOnline && user) {
      try {
        await actionsApi.delete(actionId);
      } catch (error) {
        console.error('Error deleting action from server:', error);
      }
    }
  };

  // Create template
  const createTemplate = async (templateData) => {
    const newTemplate = {
      id: `tpl-${uuidv4()}`,
      ...templateData,
      isDefault: false,
      createdAt: new Date().toISOString(),
      createdBy: user?.email || 'Anonymous',
    };

    const updated = [...templates, newTemplate];
    await saveTemplates(updated);

    // Sync to server if online
    if (isOnline && user) {
      try {
        await templatesApi.create(newTemplate);
      } catch (error) {
        console.error('Error saving template to server:', error);
      }
    }

    return newTemplate;
  };

  // Update template
  const updateTemplate = async (templateId, updates) => {
    const updated = templates.map(t =>
      t.id === templateId ? { ...t, ...updates } : t
    );
    await saveTemplates(updated);

    // Sync to server if online (only for custom templates)
    const template = templates.find(t => t.id === templateId);
    if (isOnline && user && !template?.isDefault) {
      try {
        await templatesApi.update(templateId, updates);
      } catch (error) {
        console.error('Error updating template on server:', error);
      }
    }
  };

  // Delete template
  const deleteTemplate = async (templateId) => {
    const updated = templates.filter(t => t.id !== templateId);
    await saveTemplates(updated);

    // Sync to server if online
    if (isOnline && user) {
      try {
        await templatesApi.delete(templateId);
      } catch (error) {
        console.error('Error deleting template from server:', error);
      }
    }
  };

  return (
    <AuditContext.Provider value={{
      audits,
      templates,
      actions,
      loading,
      isOnline,
      syncStatus,
      createAudit,
      updateAudit,
      completeAudit,
      deleteAudit,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      createAction,
      updateAction,
      deleteAction,
      calculateScore,
      loadData,
      syncWithServer,
    }}>
      {children}
    </AuditContext.Provider>
  );
}

export const useAudits = () => {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudits must be used within an AuditProvider');
  }
  return context;
};
