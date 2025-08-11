// Excel Import/Export Utilities for Aurora Audit Platform
// Handles Excel file operations for questions and audits

import * as XLSX from 'xlsx';

// Excel column mappings for questions
const QUESTION_COLUMNS = {
  'Question Text': 'text',
  'Type': 'type',
  'Category': 'category',
  'Required': 'required',
  'Options': 'options',
  'Validation Rules': 'validation',
  'Help Text': 'helpText',
  'Order': 'orderIndex'
};

// Excel column mappings for audits
const AUDIT_COLUMNS = {
  'Audit Title': 'title',
  'Description': 'description',
  'Status': 'status',
  'Department': 'department',
  'Location': 'location',
  'Assigned To': 'assignedTo',
  'Due Date': 'dueDate',
  'Priority': 'priority',
  'Questions Completed': 'questionsCompleted',
  'Total Questions': 'totalQuestions'
};

// Question types mapping
const QUESTION_TYPES = {
  'Text': 'text',
  'Number': 'number',
  'Yes/No': 'boolean',
  'Date': 'date',
  'Single Choice': 'select',
  'Multiple Choice': 'multiselect',
  'File Upload': 'file',
  'Rating': 'rating',
  'Signature': 'signature'
};

// Export questions to Excel
export async function exportQuestionsToExcel(questions, filename = 'questions.xlsx') {
  try {
    // Prepare data for export
    const exportData = questions.map((question, index) => ({
      'ID': question.id,
      'Question Text': question.text,
      'Type': getQuestionTypeLabel(question.type),
      'Category': question.category || '',
      'Required': question.required ? 'Yes' : 'No',
      'Options': Array.isArray(question.options) ? question.options.join(', ') : '',
      'Validation Rules': question.validation ? JSON.stringify(question.validation) : '',
      'Help Text': question.helpText || '',
      'Order': question.orderIndex || index + 1,
      'Active': question.active !== false ? 'Yes' : 'No'
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create questions worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    const colWidths = [
      { wch: 15 }, // ID
      { wch: 50 }, // Question Text
      { wch: 15 }, // Type
      { wch: 20 }, // Category
      { wch: 10 }, // Required
      { wch: 30 }, // Options
      { wch: 30 }, // Validation Rules
      { wch: 30 }, // Help Text
      { wch: 10 }, // Order
      { wch: 10 }  // Active
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');

    // Add metadata worksheet
    const metadata = [
      { Property: 'Export Date', Value: new Date().toISOString() },
      { Property: 'Total Questions', Value: questions.length },
      { Property: 'Categories', Value: [...new Set(questions.map(q => q.category))].join(', ') },
      { Property: 'Platform', Value: 'Aurora Audit Platform' },
      { Property: 'Version', Value: '1.0.0' }
    ];
    const metaWs = XLSX.utils.json_to_sheet(metadata);
    XLSX.utils.book_append_sheet(wb, metaWs, 'Metadata');

    // Add instructions worksheet
    const instructions = [
      { Column: 'Question Text', Description: 'The question to be asked (required)', Example: 'Are all emergency exits clearly marked?' },
      { Column: 'Type', Description: 'Question type', Example: 'Text, Number, Yes/No, Date, Single Choice, Multiple Choice, File Upload' },
      { Column: 'Category', Description: 'Question category for grouping', Example: 'Safety, Compliance, Quality' },
      { Column: 'Required', Description: 'Whether the question must be answered', Example: 'Yes or No' },
      { Column: 'Options', Description: 'Comma-separated options for choice questions', Example: 'Option 1, Option 2, Option 3' },
      { Column: 'Validation Rules', Description: 'JSON validation rules', Example: '{"min": 0, "max": 100}' },
      { Column: 'Help Text', Description: 'Additional help text for the question', Example: 'Check all visible exits' },
      { Column: 'Order', Description: 'Display order of the question', Example: '1, 2, 3...' },
      { Column: 'Active', Description: 'Whether the question is active', Example: 'Yes or No' }
    ];
    const instructWs = XLSX.utils.json_to_sheet(instructions);
    instructWs['!cols'] = [{ wch: 20 }, { wch: 50 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, instructWs, 'Instructions');

    // Write file
    XLSX.writeFile(wb, filename);
    
    return { success: true, count: questions.length };
  } catch (error) {
    console.error('Export error:', error);
    throw new Error(`Failed to export questions: ${error.message}`);
  }
}

// Import questions from Excel
export async function importQuestionsFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Read workbook
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first worksheet (assuming it contains questions)
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Validate and transform data
        const questions = jsonData.map((row, index) => {
          // Validate required fields
          if (!row['Question Text']) {
            throw new Error(`Row ${index + 2}: Question Text is required`);
          }
          
          // Transform to question object
          return {
            id: row['ID'] || generateId(),
            text: row['Question Text'].trim(),
            type: getQuestionTypeValue(row['Type']) || 'text',
            category: row['Category']?.trim() || 'General',
            required: row['Required']?.toLowerCase() === 'yes',
            options: parseOptions(row['Options']),
            validation: parseValidation(row['Validation Rules']),
            helpText: row['Help Text']?.trim() || null,
            orderIndex: parseInt(row['Order']) || index + 1,
            active: row['Active']?.toLowerCase() !== 'no',
            importedAt: new Date().toISOString()
          };
        });
        
        // Validate question types
        questions.forEach((q, index) => {
          if (!isValidQuestionType(q.type)) {
            throw new Error(`Row ${index + 2}: Invalid question type '${q.type}'`);
          }
          
          // Validate options for select types
          if (['select', 'multiselect'].includes(q.type) && (!q.options || q.options.length === 0)) {
            throw new Error(`Row ${index + 2}: Options required for ${q.type} questions`);
          }
        });
        
        resolve({
          success: true,
          questions,
          count: questions.length,
          filename: file.name
        });
      } catch (error) {
        reject(new Error(`Import failed: ${error.message}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Export audits to Excel
export async function exportAuditsToExcel(audits, includeResponses = false, filename = 'audits.xlsx') {
  try {
    const wb = XLSX.utils.book_new();
    
    // Audits summary sheet
    const auditData = audits.map(audit => ({
      'ID': audit.id,
      'Title': audit.title,
      'Description': audit.description || '',
      'Status': formatStatus(audit.status),
      'Progress': `${audit.progress || 0}%`,
      'Department': audit.department || '',
      'Location': audit.location || '',
      'Assigned To': audit.assignedTo || '',
      'Due Date': formatDate(audit.dueDate),
      'Priority': audit.priority || 'medium',
      'Questions Completed': audit.questionsCompleted || 0,
      'Total Questions': audit.totalQuestions || 0,
      'Created Date': formatDate(audit.createdAt),
      'Last Updated': formatDate(audit.updatedAt)
    }));
    
    const ws = XLSX.utils.json_to_sheet(auditData);
    ws['!cols'] = [
      { wch: 15 }, // ID
      { wch: 30 }, // Title
      { wch: 40 }, // Description
      { wch: 15 }, // Status
      { wch: 10 }, // Progress
      { wch: 20 }, // Department
      { wch: 20 }, // Location
      { wch: 20 }, // Assigned To
      { wch: 15 }, // Due Date
      { wch: 10 }, // Priority
      { wch: 20 }, // Questions Completed
      { wch: 15 }, // Total Questions
      { wch: 15 }, // Created Date
      { wch: 15 }  // Last Updated
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Audits');
    
    // Add individual audit sheets if responses included
    if (includeResponses) {
      for (const audit of audits) {
        if (audit.responses && audit.responses.length > 0) {
          const responseData = audit.responses.map(response => ({
            'Question': response.questionText || '',
            'Category': response.category || '',
            'Answer': formatAnswer(response.answer, response.type),
            'Required': response.required ? 'Yes' : 'No',
            'Answered Date': formatDate(response.answeredAt),
            'Attachments': response.attachments?.length || 0,
            'Notes': response.notes || ''
          }));
          
          const responseWs = XLSX.utils.json_to_sheet(responseData);
          const sheetName = sanitizeSheetName(audit.title);
          XLSX.utils.book_append_sheet(wb, responseWs, sheetName);
        }
      }
    }
    
    // Add statistics sheet
    const stats = calculateAuditStatistics(audits);
    const statsWs = XLSX.utils.json_to_sheet([stats]);
    XLSX.utils.book_append_sheet(wb, statsWs, 'Statistics');
    
    // Write file
    XLSX.writeFile(wb, filename);
    
    return { success: true, count: audits.length };
  } catch (error) {
    console.error('Export error:', error);
    throw new Error(`Failed to export audits: ${error.message}`);
  }
}

// Download Excel template for questions
export function downloadQuestionTemplate() {
  const templateData = [
    {
      'Question Text': 'Are all emergency exits clearly marked?',
      'Type': 'Yes/No',
      'Category': 'Safety',
      'Required': 'Yes',
      'Options': '',
      'Validation Rules': '',
      'Help Text': 'Check all visible emergency exits',
      'Order': 1,
      'Active': 'Yes'
    },
    {
      'Question Text': 'Number of fire extinguishers on the floor',
      'Type': 'Number',
      'Category': 'Safety',
      'Required': 'Yes',
      'Options': '',
      'Validation Rules': '{"min": 0, "max": 100}',
      'Help Text': 'Count all fire extinguishers in the area',
      'Order': 2,
      'Active': 'Yes'
    },
    {
      'Question Text': 'Overall safety rating',
      'Type': 'Single Choice',
      'Category': 'Safety',
      'Required': 'Yes',
      'Options': 'Excellent, Good, Fair, Poor',
      'Validation Rules': '',
      'Help Text': 'Rate the overall safety conditions',
      'Order': 3,
      'Active': 'Yes'
    },
    {
      'Question Text': 'Areas requiring attention',
      'Type': 'Multiple Choice',
      'Category': 'Safety',
      'Required': 'No',
      'Options': 'Exits, Equipment, Signage, Lighting, Ventilation',
      'Validation Rules': '',
      'Help Text': 'Select all areas that need improvement',
      'Order': 4,
      'Active': 'Yes'
    },
    {
      'Question Text': 'Date of last inspection',
      'Type': 'Date',
      'Category': 'Compliance',
      'Required': 'Yes',
      'Options': '',
      'Validation Rules': '',
      'Help Text': 'Enter the date of the previous inspection',
      'Order': 5,
      'Active': 'Yes'
    }
  ];
  
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(templateData);
  
  // Set column widths
  ws['!cols'] = [
    { wch: 50 }, // Question Text
    { wch: 15 }, // Type
    { wch: 20 }, // Category
    { wch: 10 }, // Required
    { wch: 40 }, // Options
    { wch: 30 }, // Validation Rules
    { wch: 40 }, // Help Text
    { wch: 10 }, // Order
    { wch: 10 }  // Active
  ];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Question Template');
  
  // Add instructions
  const instructions = [
    { Instruction: 'How to use this template:' },
    { Instruction: '1. Fill in your questions following the example format' },
    { Instruction: '2. Use the specified question types: Text, Number, Yes/No, Date, Single Choice, Multiple Choice, File Upload' },
    { Instruction: '3. For choice questions, provide comma-separated options' },
    { Instruction: '4. Validation rules should be in JSON format' },
    { Instruction: '5. Save the file and import it into Aurora Audit Platform' }
  ];
  
  const instructWs = XLSX.utils.json_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, instructWs, 'Instructions');
  
  XLSX.writeFile(wb, 'aurora_question_template.xlsx');
}

// Utility functions

function generateId() {
  return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getQuestionTypeLabel(type) {
  const labels = {
    'text': 'Text',
    'number': 'Number',
    'boolean': 'Yes/No',
    'date': 'Date',
    'select': 'Single Choice',
    'multiselect': 'Multiple Choice',
    'file': 'File Upload',
    'rating': 'Rating',
    'signature': 'Signature'
  };
  return labels[type] || type;
}

function getQuestionTypeValue(label) {
  if (!label) return 'text';
  
  const normalizedLabel = label.toLowerCase().trim();
  for (const [key, value] of Object.entries(QUESTION_TYPES)) {
    if (key.toLowerCase() === normalizedLabel) {
      return value;
    }
  }
  
  // Check if it's already a valid type value
  if (isValidQuestionType(normalizedLabel)) {
    return normalizedLabel;
  }
  
  return 'text';
}

function isValidQuestionType(type) {
  const validTypes = ['text', 'number', 'boolean', 'date', 'select', 'multiselect', 'file', 'rating', 'signature'];
  return validTypes.includes(type);
}

function parseOptions(optionsString) {
  if (!optionsString || typeof optionsString !== 'string') {
    return null;
  }
  
  return optionsString
    .split(',')
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);
}

function parseValidation(validationString) {
  if (!validationString || typeof validationString !== 'string') {
    return null;
  }
  
  try {
    return JSON.parse(validationString);
  } catch (error) {
    console.warn('Failed to parse validation rules:', validationString);
    return null;
  }
}

function formatStatus(status) {
  const statusMap = {
    'draft': 'Draft',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'archived': 'Archived'
  };
  return statusMap[status] || status;
}

function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return dateString;
  }
}

function formatAnswer(answer, type) {
  if (answer === null || answer === undefined) {
    return '';
  }
  
  switch (type) {
    case 'boolean':
      return answer ? 'Yes' : 'No';
    case 'date':
      return formatDate(answer);
    case 'multiselect':
      return Array.isArray(answer) ? answer.join(', ') : answer;
    default:
      return answer.toString();
  }
}

function sanitizeSheetName(name) {
  // Excel sheet names have restrictions
  let sanitized = name.substring(0, 31); // Max 31 characters
  sanitized = sanitized.replace(/[\\\/\*\?\[\]:]/g, '_'); // Remove invalid characters
  return sanitized;
}

function calculateAuditStatistics(audits) {
  const total = audits.length;
  const completed = audits.filter(a => a.status === 'completed').length;
  const inProgress = audits.filter(a => a.status === 'in_progress').length;
  const draft = audits.filter(a => a.status === 'draft').length;
  
  const totalQuestions = audits.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);
  const completedQuestions = audits.reduce((sum, a) => sum + (a.questionsCompleted || 0), 0);
  
  const avgProgress = total > 0 
    ? Math.round(audits.reduce((sum, a) => sum + (a.progress || 0), 0) / total)
    : 0;
  
  return {
    'Total Audits': total,
    'Completed': completed,
    'In Progress': inProgress,
    'Draft': draft,
    'Total Questions': totalQuestions,
    'Completed Questions': completedQuestions,
    'Average Progress': `${avgProgress}%`,
    'Completion Rate': total > 0 ? `${Math.round((completed / total) * 100)}%` : '0%'
  };
}

export default {
  exportQuestionsToExcel,
  importQuestionsFromExcel,
  exportAuditsToExcel,
  downloadQuestionTemplate
};