import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import AuditForm from '@/features/audits/AuditForm';
import { api } from '@/lib/api';
import { auditDB } from '@/lib/db';
import { generateId, getDeviceInfo } from '@/lib/utils';
import type { Template, Audit } from '@/types';

export default function AuditRunner() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template | null>(null);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const initAudit = async () => {
    try {
      if (id && id !== 'new') {
        const draft = await auditDB.getDraft(id);
        if (draft) {
          setAudit(draft);
          const tmpl = await api.getTemplate(draft.templateId);
          setTemplate(tmpl);
          setLoading(false);
          return;
        }
      }

      const templates = await api.getTemplates();
      const tmpl = templates[0];
      if (!tmpl || !user) {
        throw new Error('No template available');
      }
      setTemplate(tmpl);

      const newAudit: Audit = {
        auditId: generateId(),
        templateId: tmpl.templateId,
        siteId: user.siteIds[0] || '',
        siteName: `Site ${user.siteIds[0] || ''}`,
        startedAt: new Date().toISOString(),
        auditor: {
          id: user.id,
          name: user.name,
          role: user.role
        },
        status: 'DRAFT',
        items: [],
        signatures: [],
        metadata: {
          appVersion: '0.1.0',
          device: getDeviceInfo()
        }
      };

      setAudit(newAudit);
      await auditDB.saveDraft(newAudit);
    } catch (error) {
      console.error('Failed to initialize audit', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedAudit: Audit) => {
    await auditDB.saveDraft(updatedAudit);
    setAudit(updatedAudit);
  };

  const handleComplete = async (completedAudit: Audit) => {
    try {
      const finalAudit = await api.completeAudit(completedAudit.auditId, {
        ...completedAudit,
        status: 'COMPLETED',
        completedAt: new Date().toISOString()
      });

      await auditDB.deleteDraft(completedAudit.auditId);
      setAudit(finalAudit);
      navigate('/completed');
    } catch (error) {
      console.error('Failed to complete audit', error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!template || !audit) {
    return <div className="p-4">Failed to load audit</div>;
  }

  return <AuditForm template={template} audit={audit} onSave={handleSave} onComplete={handleComplete} />;
}
