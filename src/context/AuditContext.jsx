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
    id: 'tpl-ds-indoor-safety',
    title: 'DS Indoor Safety Audit (UTR Only)',
    description: 'Safety inspection for internal Delivery Station operations (Induct, Sort, Stage), focusing on ASchG compliance and physical hazards.',
    category: 'Safety',
    icon: 'warehouse',
    color: '#FF9900',
    estimatedTime: 25,
    isDefault: true,
    sections: [
      {
        id: 'sec-floors-aisles',
        title: 'Floors & Walkways (ASchG § 6)',
        items: [
          {
            id: 'i1',
            text: "Are 'Green Mile' walkways clearly marked, unobstructed, and free of pallets/packages?",
            type: 'bool',
            required: true,
            critical: true,
          },
          {
            id: 'i2',
            text: 'Are emergency exit routes fully accessible and unlocked (Fluchtwegkennzeichnung)?',
            type: 'bool',
            required: true,
            critical: true,
          },
          {
            id: 'i3',
            text: 'Is the floor free of trip hazards (loose tape, straps, debris)?',
            type: 'bool',
            required: true,
          },
        ],
      },
      {
        id: 'sec-conveyors',
        title: 'Conveyors & Machinery',
        items: [
          {
            id: 'i4',
            text: 'Are all conveyor nip points and moving parts properly guarded?',
            type: 'bool',
            required: true,
            critical: true,
          },
          {
            id: 'i5',
            text: 'Are Emergency Stops (E-Stops) visible, accessible, and not blocked by staging?',
            type: 'bool',
            required: true,
            critical: true,
          },
          {
            id: 'i6',
            text: 'Are cross-overs (bridges) used strictly; no jumping over/crawling under conveyors?',
            type: 'bool',
            required: true,
          },
        ],
      },
      {
        id: 'sec-handling-equipment',
        title: 'Carts & Trolleys (U-Boats/Go-Carts)',
        items: [
          {
            id: 'i7',
            text: 'Are brakes on U-Boats and Go-Carts functional?',
            type: 'bool',
            required: true,
          },
          {
            id: 'i8',
            text: 'Are carts free from sharp edges or damaged wheels?',
            type: 'bool',
            required: true,
          },
          {
            id: 'i9',
            text: 'Are heavy items placed at the bottom of carts to prevent tipping?',
            type: 'bool',
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-sort-quality',
    title: 'Sortation & Staging Quality Check',
    description: 'Quality assurance for the sortation process before packages leave the building.',
    category: 'Quality',
    icon: 'clipboard-check',
    color: '#007185',
    estimatedTime: 15,
    isDefault: true,
    sections: [
      {
        id: 'sec-package-condition',
        title: 'Package Condition (Induct/Buffer)',
        items: [
          {
            id: 'q1',
            text: 'Are damages taped/repaired effectively (Amazon Tape standards)?',
            type: 'bool',
            required: true,
          },
          {
            id: 'q2',
            text: 'Are shipping labels (SAL) fully readable and not covered by tape/straps?',
            type: 'bool',
            required: true,
          },
          {
            id: 'q3',
            text: 'Are leaking or hazardous items segregated immediately (Hazmat protocol)?',
            type: 'bool',
            required: true,
            critical: true,
          },
        ],
      },
      {
        id: 'sec-staging-accuracy',
        title: 'Staging & Route Accuracy',
        items: [
          {
            id: 'q4',
            text: 'Are bags/oversize packages staged in the correct lanes/zones?',
            type: 'bool',
            required: true,
          },
          {
            id: 'q5',
            text: 'Are bags zipped closed and handles intact?',
            type: 'bool',
            required: true,
          },
          {
            id: 'q6',
            text: "Are 'Virtually Sorted' items physically present in the correct buffer location?",
            type: 'bool',
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-sifa-indoor-legal',
    title: 'SIFA Audit – Indoor Compliance (ASchG)',
    description: 'Legal compliance audit for indoor workspaces (ASchG, AStV) excluding yard/traffic.',
    category: 'Compliance',
    icon: 'shield-check',
    color: '#CC0000',
    estimatedTime: 40,
    isDefault: false,
    sections: [
      {
        id: 'sec-work-environment',
        title: 'Work Environment (ASchG § 22-24)',
        items: [
          {
            id: 'l1',
            text: 'Is lighting adequate in all pick/stow/staging aisles (min. 100/200 Lux depending on area)?',
            type: 'bool',
            required: true,
          },
          {
            id: 'l2',
            text: 'Is the temperature within acceptable limits for physical work (AStV)?',
            type: 'bool',
            required: true,
          },
          {
            id: 'l3',
            text: 'Is ventilation functioning effectively; no accumulation of dust?',
            type: 'bool',
            required: true,
          },
        ],
      },
      {
        id: 'sec-ergonomics-indoor',
        title: 'Ergonomics (Manual Handling)',
        items: [
          {
            id: 'l4',
            text: 'Is the 15kg safety lifting rule respected (Two-person lift or mechanical aid)?',
            type: 'bool',
            required: true,
            critical: true,
          },
          {
            id: 'l5',
            text: 'Are anti-fatigue mats provided at stationary workstations (e.g., Induct/Divert)?',
            type: 'bool',
            required: true,
          },
          {
            id: 'l6',
            text: 'Are heavy items stored at waist height (Golden Zone) where possible?',
            type: 'bool',
            required: true,
          },
        ],
      },
      {
        id: 'sec-fire-protection',
        title: 'Fire Protection (Indoor)',
        items: [
          {
            id: 'l7',
            text: 'Are fire extinguishers visible and unobstructed by pallets/carts?',
            type: 'bool',
            required: true,
            critical: true,
          },
          {
            id: 'l8',
            text: 'Are fire doors closed (not wedged open) and functional?',
            type: 'bool',
            required: true,
            critical: true,
          },
        ],
      },
    ],
  },
  {
    id: 'tpl-5s-indoor',
    title: '5S Workplace Audit (Indoor Zones)',
    description: 'Cleanliness and organization check for Pick, Buffer, and Staging areas.',
    category: 'Operations',
    icon: 'sparkles',
    color: '#6366F1',
    estimatedTime: 20,
    isDefault: true,
    sections: [
      {
        id: 'sec-sort-set',
        title: 'Sort & Set in Order',
        items: [
          {
            id: 's1',
            text: 'Are operational areas free of non-essential items (personal items, food, trash)?',
            type: 'bool',
            required: true,
          },
          {
            id: 's2',
            text: 'Are scanners, radios, and batteries in their designated charging cradles?',
            type: 'bool',
            required: true,
          },
        ],
      },
      {
        id: 'sec-shine-standardize',
        title: 'Shine & Standardize',
        items: [
          {
            id: 's3',
            text: 'Are hydration stations clean and cups disposed of properly?',
            type: 'bool',
            required: true,
          },
          {
            id: 's4',
            text: 'Is floor tape (5S markings) intact and not peeling?',
            type: 'bool',
            required: true,
          },
          {
            id: 's5',
            text: 'Are waste bins not overflowing?',
            type: 'bool',
            required: true,
          },
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

      // Get deleted default template IDs
      const deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaultTemplates') || '[]');

      // Merge with default templates (excluding deleted ones)
      const mergedTemplates = DEFAULT_TEMPLATES.filter(t => !deletedDefaults.includes(t.id));
      serverTemplates.forEach(t => {
        if (!mergedTemplates.find(dt => dt.id === t.id) && !deletedDefaults.includes(t.id)) {
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

      // Load templates (merge defaults with custom, excluding deleted ones)
      const savedTemplates = await templatesStore.getItem('templates') || [];
      const deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaultTemplates') || '[]');
      const mergedTemplates = DEFAULT_TEMPLATES.filter(t => !deletedDefaults.includes(t.id));
      savedTemplates.forEach(t => {
        if (!mergedTemplates.find(dt => dt.id === t.id) && !deletedDefaults.includes(t.id)) {
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

  // Delete template (all templates can be deleted, including defaults)
  const deleteTemplate = async (templateId) => {
    const updated = templates.filter(t => t.id !== templateId);
    await saveTemplates(updated);

    // Also remove from local storage for default templates
    const template = templates.find(t => t.id === templateId);
    if (template?.isDefault) {
      // Store deleted default template IDs to prevent re-adding on load
      const deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaultTemplates') || '[]');
      if (!deletedDefaults.includes(templateId)) {
        deletedDefaults.push(templateId);
        localStorage.setItem('deletedDefaultTemplates', JSON.stringify(deletedDefaults));
      }
    }

    // Sync to server if online
    if (isOnline && user) {
      try {
        await templatesApi.delete(templateId);
      } catch (error) {
        console.error('Error deleting template from server:', error);
      }
    }
  };

  // Restore all default templates
  const restoreDefaultTemplates = async () => {
    // Clear deleted defaults list
    localStorage.removeItem('deletedDefaultTemplates');

    // Merge default templates back in
    const currentCustomTemplates = templates.filter(t => !t.isDefault);
    const restoredTemplates = [...DEFAULT_TEMPLATES, ...currentCustomTemplates];
    await saveTemplates(restoredTemplates);
    setTemplates(restoredTemplates);
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
      restoreDefaultTemplates,
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
