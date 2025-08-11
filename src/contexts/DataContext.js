import React, { createContext, useState, useContext, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  // Audit management
  const [audits, setAudits] = useState([]);
  const [currentAudit, setCurrentAudit] = useState(null);
  
  // Question management
  const [questions, setQuestions] = useState([]);
  const [templates, setTemplates] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load initial data from localStorage
  useEffect(() => {
    const savedAudits = localStorage.getItem('audits');
    const savedQuestions = localStorage.getItem('questions');
    const savedTemplates = localStorage.getItem('templates');
    
    if (savedAudits) setAudits(JSON.parse(savedAudits));
    if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('audits', JSON.stringify(audits));
  }, [audits]);

  useEffect(() => {
    localStorage.setItem('questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('templates', JSON.stringify(templates));
  }, [templates]);

  // Audit functions
  const createAudit = (auditData) => {
    const newAudit = {
      ...auditData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
    setAudits([...audits, newAudit]);
    return newAudit;
  };

  const updateAudit = (id, updates) => {
    setAudits(audits.map(audit => 
      audit.id === id 
        ? { ...audit, ...updates, updatedAt: new Date().toISOString() }
        : audit
    ));
  };

  const deleteAudit = (id) => {
    setAudits(audits.filter(audit => audit.id !== id));
  };

  // Question functions
  const createQuestion = (questionData) => {
    const newQuestion = {
      ...questionData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setQuestions([...questions, newQuestion]);
    return newQuestion;
  };

  const updateQuestion = (id, updates) => {
    setQuestions(questions.map(question => 
      question.id === id 
        ? { ...question, ...updates, updatedAt: new Date().toISOString() }
        : question
    ));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter(question => question.id !== id));
  };

  // Template functions
  const createTemplate = (templateData) => {
    const newTemplate = {
      ...templateData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setTemplates([...templates, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id, updates) => {
    setTemplates(templates.map(template => 
      template.id === id 
        ? { ...template, ...updates, updatedAt: new Date().toISOString() }
        : template
    ));
  };

  const deleteTemplate = (id) => {
    setTemplates(templates.filter(template => template.id !== id));
  };

  const value = {
    // State
    audits,
    currentAudit,
    questions,
    templates,
    loading,
    error,
    
    // Setters
    setCurrentAudit,
    setLoading,
    setError,
    
    // Audit functions
    createAudit,
    updateAudit,
    deleteAudit,
    
    // Question functions
    createQuestion,
    updateQuestion,
    deleteQuestion,
    
    // Template functions
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;