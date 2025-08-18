import React, { useState, useEffect } from 'react';
import { sections } from '../data/checklist';
import AuditSection from '../components/AuditSection';
import { auditService } from '../services/auditService';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { generatePdf } from '../utils/pdf';

const AuditPage = () => {
  const [responses, setResponses] = useState({});
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const station = localStorage.getItem('aurora_station');

  useEffect(() => {
    const load = async () => {
      if (id) {
        const data = await auditService.get(id);
        setResponses(data.responses || {});
      }
      setLoaded(true);
    };
    load();
  }, [id]);

  const handleChange = (sectionId, itemId, field, value) => {
    setResponses((prev) => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [itemId]: { ...prev[sectionId]?.[itemId], [field]: value },
      },
    }));
  };

  const handleSave = async () => {
    const auditId = id || uuidv4();
    const data = {
      id: auditId,
      station,
      date: new Date().toISOString(),
      responses,
    };
    if (id) {
      await auditService.update(id, data);
    } else {
      await auditService.create(data);
    }
    generatePdf(data);
    navigate('/dashboard');
  };

  if (!loaded) return <div className="p-4">Loading...</div>;
  if (!station) return <div className="p-4">No station selected.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Audit - {station}</h1>
      {sections.map((section) => (
        <AuditSection key={section.id} section={section} onChange={handleChange} />
      ))}
      <button
        onClick={handleSave}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded"
      >
        Save Audit
      </button>
    </div>
  );
};

export default AuditPage;
