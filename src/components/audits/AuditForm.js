import React, { useState } from 'react';
import { useOffline } from '../../hooks/useOffline';
import { useAutoSave } from '../../hooks/useAutoSave';
import { auditService } from '../../services/auditService';

const AuditForm = ({ audit, questions = [], onSubmit, onCancel, mode = 'create' }) => {
  const isOffline = useOffline();
  const [formData, setFormData] = useState({
    title: audit?.title || '',
    description: audit?.description || '',
    location: audit?.metadata?.location || '',
    department: audit?.metadata?.department || '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'edit' && audit?.id) {
        await auditService.update(audit.id, formData);
      } else {
        await auditService.create(formData);
      }
      if (onSubmit) onSubmit(formData);
    } catch (error) {
      console.error('Error saving audit:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>{mode === 'create' ? 'New Audit' : 'Edit Audit'}</h2>
      
      {isOffline && (
        <div style={{ background: '#ff9800', color: 'white', padding: '10px', marginBottom: '20px' }}>
          Working Offline
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>
            Audit Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="location" style={{ display: 'block', marginBottom: '5px' }}>
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="department" style={{ display: 'block', marginBottom: '5px' }}>
            Department
          </label>
          <input
            type="text"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3>Questions</h3>
          {questions.length === 0 ? (
            <p>No questions available.</p>
          ) : (
            <p>{questions.length} questions to answer</p>
          )}
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
          <button type="button" onClick={onCancel} style={{ padding: '10px 20px' }}>
            Cancel
          </button>
          <button type="submit" style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none' }}>
            {mode === 'create' ? 'Create Audit' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuditForm;
