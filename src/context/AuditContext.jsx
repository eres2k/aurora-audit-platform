import React, { createContext, useContext, useState, useEffect } from 'react';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';

const AuditContext = createContext();

// Initialize localforage stores
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

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
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
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const saveAudits = async (newAudits) => {
    await auditsStore.setItem('audits', newAudits);
    setAudits(newAudits);
  };

  const saveTemplates = async (newTemplates) => {
    await templatesStore.setItem('templates', newTemplates);
    setTemplates(newTemplates);
  };

  const saveActions = async (newActions) => {
    await actionsStore.setItem('actions', newActions);
    setActions(newActions);
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
      globalNotes: '',
      photos: [],
      signature: null,
    };

    const updated = [...audits, newAudit];
    await saveAudits(updated);
    return newAudit;
  };

  // Update audit
  const updateAudit = async (auditId, updates) => {
    const updated = audits.map(a =>
      a.id === auditId ? { ...a, ...updates } : a
    );
    await saveAudits(updated);
  };

  // Complete audit
  const completeAudit = async (auditId, finalData) => {
    const audit = audits.find(a => a.id === auditId);
    if (!audit) throw new Error('Audit not found');

    const template = templates.find(t => t.id === audit.templateId);
    const score = calculateScore(template, finalData.answers);

    const updated = audits.map(a =>
      a.id === auditId
        ? {
            ...a,
            ...finalData,
            status: 'completed',
            score,
            completedAt: new Date().toISOString(),
          }
        : a
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
              notes: finalData.notes?.[item.id] || '',
              location: selectedStation,
            });
          }
        });
      });
    }

    if (newActions.length > 0) {
      await saveActions([...actions, ...newActions]);
    }

    return score;
  };

  // Delete audit
  const deleteAudit = async (auditId) => {
    const updated = audits.filter(a => a.id !== auditId);
    await saveAudits(updated);
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
    const updated = actions.map(a =>
      a.id === actionId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    );
    await saveActions(updated);
  };

  // Create template
  const createTemplate = async (templateData) => {
    const newTemplate = {
      id: `tpl-${uuidv4()}`,
      ...templateData,
      createdAt: new Date().toISOString(),
      createdBy: user?.email || 'Anonymous',
    };
    await saveTemplates([...templates, newTemplate]);
    return newTemplate;
  };

  // Update template
  const updateTemplate = async (templateId, updates) => {
    const updated = templates.map(t =>
      t.id === templateId ? { ...t, ...updates } : t
    );
    await saveTemplates(updated);
  };

  // Delete template
  const deleteTemplate = async (templateId) => {
    // Don't delete default templates
    if (DEFAULT_TEMPLATES.find(t => t.id === templateId)) {
      throw new Error('Cannot delete default templates');
    }
    const updated = templates.filter(t => t.id !== templateId);
    await saveTemplates(updated);
  };

  return (
    <AuditContext.Provider value={{
      audits,
      templates,
      actions,
      loading,
      createAudit,
      updateAudit,
      completeAudit,
      deleteAudit,
      createTemplate,
      updateTemplate,
      deleteTemplate,
      updateAction,
      calculateScore,
      loadData,
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
