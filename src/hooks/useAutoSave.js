// src/hooks/useAutoSave.js
import { useEffect, useRef, useCallback } from 'react';
import { debounce } from '../utils/debounce';

export const useAutoSave = ({ data, enabled, onSave, interval = 30000 }) => {
  const saveTimerRef = useRef(null);
  const lastSavedDataRef = useRef(null);

  const saveData = useCallback(async () => {
    if (!enabled) return;
    
    const dataString = JSON.stringify(data);
    if (dataString === lastSavedDataRef.current) {
      return; // No changes to save
    }

    try {
      await onSave(data);
      lastSavedDataRef.current = dataString;
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [data, enabled, onSave]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(saveData, interval),
    [saveData, interval]
  );

  useEffect(() => {
    if (enabled) {
      // Clear any existing timer
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }

      // Set up periodic auto-save
      saveTimerRef.current = setInterval(() => {
        saveData();
      }, interval);

      // Also save on data changes (debounced)
      debouncedSave();
    }

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current);
      }
    };
  }, [enabled, saveData, debouncedSave, interval]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (enabled) {
        saveData();
      }
    };
  }, [enabled, saveData]);

  return { saveData };
};

// src/utils/debounce.js
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// src/services/fileService.js
import api from '../api/client';

export const fileService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  uploadMultiple: async (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    
    const response = await api.post('/files/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  get: async (id) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/files/${id}`);
  },

  getUrl: (id) => {
    return `${process.env.REACT_APP_API_URL}/files/${id}`;
  },

  compressImage: async (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              }));
            },
            'image/jpeg',
            quality
          );
        };
      };
    });
  },
};

// src/components/audit/AuditFormPage.js
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Container, Backdrop, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import AuditForm from './AuditForm';
import { auditService } from '../../services/auditService';
import { questionService } from '../../services/questionService';
import { templateService } from '../../services/templateService';

const AuditFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  
  const isEditMode = !!id;

  // Fetch existing audit if in edit mode
  const { data: audit, isLoading: auditLoading } = useQuery({
    queryKey: ['audit', id],
    queryFn: () => auditService.getById(id),
    enabled: isEditMode,
  });

  // Fetch questions based on template or default
  const templateId = audit?.templateId;
  const { data: questions, isLoading: questionsLoading } = useQuery({
    queryKey: ['questions', templateId],
    queryFn: async () => {
      if (templateId) {
        const template = await templateService.getById(templateId);
        return template.questions;
      }
      return questionService.getAll();
    },
  });

  const handleSubmit = () => {
    navigate('/audits');
  };

  const handleCancel = () => {
    navigate('/audits');
  };

  if (auditLoading || questionsLoading) {
    return (
      <Backdrop open={true}>
        <CircularProgress />
      </Backdrop>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <AuditForm
        audit={audit}
        questions={questions}
        mode={isEditMode ? 'edit' : 'create'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
};

export default AuditFormPage;

// src/models/Question.js
export const QuestionTypes = {
  TEXT: 'text',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  RADIO: 'radio',
  DATE: 'date',
  SCALE: 'scale',
  FILE: 'file',
};

export const QuestionCategories = {
  GENERAL: 'General',
  SAFETY: 'Safety',
  QUALITY: 'Quality',
  COMPLIANCE: 'Compliance',
  ENVIRONMENTAL: 'Environmental',
  OPERATIONAL: 'Operational',
  FINANCIAL: 'Financial',
  DOCUMENTATION: 'Documentation',
};

export class Question {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.text = data.text || '';
    this.type = data.type || QuestionTypes.TEXT;
    this.category = data.category || QuestionCategories.GENERAL;
    this.required = data.required || false;
    this.options = data.options || [];
    this.validation = data.validation || {};
    this.conditionalLogic = data.conditionalLogic || null;
    this.order = data.order || 0;
    this.active = data.active !== undefined ? data.active : true;
    this.allowAttachments = data.allowAttachments || false;
    this.multiline = data.multiline || false;
    this.helpText = data.helpText || '';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  validate(value) {
    // Required validation
    if (this.required && (!value || value === '')) {
      return { valid: false, message: 'This field is required' };
    }

    // Type-specific validation
    switch (this.type) {
      case QuestionTypes.NUMBER:
        if (this.validation.min !== undefined && value < this.validation.min) {
          return { valid: false, message: `Value must be at least ${this.validation.min}` };
        }
        if (this.validation.max !== undefined && value > this.validation.max) {
          return { valid: false, message: `Value must not exceed ${this.validation.max}` };
        }
        break;

      case QuestionTypes.TEXT:
        if (this.validation.minLength && value.length < this.validation.minLength) {
          return { valid: false, message: `Minimum length is ${this.validation.minLength}` };
        }
        if (this.validation.maxLength && value.length > this.validation.maxLength) {
          return { valid: false, message: `Maximum length is ${this.validation.maxLength}` };
        }
        if (this.validation.pattern) {
          const regex = new RegExp(this.validation.pattern);
          if (!regex.test(value)) {
            return { valid: false, message: 'Invalid format' };
          }
        }
        break;

      case QuestionTypes.SELECT:
      case QuestionTypes.RADIO:
        if (this.options.length > 0 && !this.options.includes(value)) {
          return { valid: false, message: 'Invalid selection' };
        }
        break;

      case QuestionTypes.MULTISELECT:
        if (this.options.length > 0) {
          const invalidOptions = value.filter(v => !this.options.includes(v));
          if (invalidOptions.length > 0) {
            return { valid: false, message: 'Invalid selections' };
          }
        }
        break;
    }

    // Custom validation
    if (this.validation.customValidator) {
      try {
        const customResult = this.validation.customValidator(value);
        if (!customResult.valid) {
          return customResult;
        }
      } catch (error) {
        console.error('Custom validation error:', error);
      }
    }

    return { valid: true };
  }

  checkCondition(values) {
    if (!this.conditionalLogic || !this.conditionalLogic.showIf) {
      return true;
    }

    const { questionId, operator, value: targetValue } = this.conditionalLogic.showIf;
    const actualValue = values[questionId];

    switch (operator) {
      case 'equals':
        return actualValue === targetValue;
      case 'not_equals':
        return actualValue !== targetValue;
      case 'contains':
        return actualValue && actualValue.includes(targetValue);
      case 'not_contains':
        return !actualValue || !actualValue.includes(targetValue);
      case 'greater_than':
        return actualValue > targetValue;
      case 'less_than':
        return actualValue < targetValue;
      case 'greater_than_or_equal':
        return actualValue >= targetValue;
      case 'less_than_or_equal':
        return actualValue <= targetValue;
      case 'is_empty':
        return !actualValue || actualValue === '' || actualValue.length === 0;
      case 'is_not_empty':
        return actualValue && actualValue !== '' && actualValue.length > 0;
      default:
        return true;
    }
  }

  toJSON() {
    return {
      id: this.id,
      text: this.text,
      type: this.type,
      category: this.category,
      required: this.required,
      options: this.options,
      validation: this.validation,
      conditionalLogic: this.conditionalLogic,
      order: this.order,
      active: this.active,
      allowAttachments: this.allowAttachments,
      multiline: this.multiline,
      helpText: this.helpText,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

// Sample questions for testing
export const sampleQuestions = [
  new Question({
    id: '1',
    text: 'Site Name',
    type: QuestionTypes.TEXT,
    category: QuestionCategories.GENERAL,
    required: true,
    helpText: 'Enter the full name of the site being audited',
  }),
  new Question({
    id: '2',
    text: 'Number of Employees',
    type: QuestionTypes.NUMBER,
    category: QuestionCategories.GENERAL,
    required: true,
    validation: { min: 1, max: 10000 },
  }),
  new Question({
    id: '3',
    text: 'Safety Equipment Present',
    type: QuestionTypes.BOOLEAN,
    category: QuestionCategories.SAFETY,
    required: true,
  }),
  new Question({
    id: '4',
    text: 'Type of Safety Equipment',
    type: QuestionTypes.MULTISELECT,
    category: QuestionCategories.SAFETY,
    options: ['Fire Extinguisher', 'First Aid Kit', 'Emergency Exit Signs', 'Safety Goggles', 'Hard Hats'],
    conditionalLogic: {
      showIf: {
        questionId: '3',
        operator: 'equals',
        value: true,
      },
    },
    allowAttachments: true,
  }),
  new Question({
    id: '5',
    text: 'Overall Compliance Rating',
    type: QuestionTypes.SCALE,
    category: QuestionCategories.COMPLIANCE,
    required: true,
    validation: { min: 1, max: 10 },
    helpText: 'Rate from 1 (Poor) to 10 (Excellent)',
  }),
  new Question({
    id: '6',
    text: 'Audit Date',
    type: QuestionTypes.DATE,
    category: QuestionCategories.GENERAL,
    required: true,
  }),
  new Question({
    id: '7',
    text: 'Additional Comments',
    type: QuestionTypes.TEXT,
    category: QuestionCategories.GENERAL,
    multiline: true,
    helpText: 'Add any additional observations or concerns',
  }),
];
