import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  CheckCircle,
  XCircle,
  MinusCircle,
  Download,
  Play,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAudits } from '../context/AuditContext';
import { Button, Card, Badge } from '../components/ui';
import { ScoreDisplay } from '../components/audit';
import { generateAuditPDF } from '../utils/pdfExport';

export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { audits, templates, deleteAudit } = useAudits();
  const [audit, setAudit] = useState(null);
  const [template, setTemplate] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const foundAudit = audits.find(a => a.id === id);
    if (foundAudit) {
      setAudit(foundAudit);
      const foundTemplate = templates.find(t => t.id === foundAudit.templateId);
      setTemplate(foundTemplate);
    }
  }, [id, audits, templates]);

  if (!audit) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <FileText size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Audit Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          The audit you're looking for doesn't exist.
        </p>
        <Button variant="primary" onClick={() => navigate('/audits')}>
          Back to Audits
        </Button>
      </div>
    );
  }

  const handleContinueAudit = () => {
    // Navigate to NewAudit with the audit data to continue
    navigate(`/audits/new?continue=${audit.id}`);
  };

  const handleExportPDF = () => {
    try {
      const filename = generateAuditPDF(audit, template);
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF export error:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAudit(audit.id);
      toast.success('Audit deleted');
      navigate('/audits');
    } catch (error) {
      toast.error('Failed to delete audit');
    }
  };

  const getAnswerIcon = (answer) => {
    if (answer === 'pass') return <CheckCircle className="text-emerald-500" size={20} />;
    if (answer === 'fail') return <XCircle className="text-red-500" size={20} />;
    if (answer === 'na') return <MinusCircle className="text-slate-400" size={20} />;
    return <MinusCircle className="text-slate-300" size={20} />;
  };

  const getAnswerText = (answer, type) => {
    if (type === 'bool') {
      if (answer === 'pass') return 'Pass';
      if (answer === 'fail') return 'Fail';
      if (answer === 'na') return 'N/A';
      return 'Not answered';
    }
    if (type === 'rating') {
      return answer ? `${answer}/5` : 'Not rated';
    }
    return answer || 'No response';
  };

  const statusConfig = {
    draft: { label: 'Draft', variant: 'default', color: 'bg-slate-500' },
    in_progress: { label: 'In Progress', variant: 'warning', color: 'bg-amber-500' },
    completed: { label: 'Completed', variant: 'success', color: 'bg-emerald-500' },
  };

  const status = statusConfig[audit.status] || statusConfig.draft;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate('/audits')}
          />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                {audit.templateTitle || 'Audit Details'}
              </h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {format(new Date(audit.date), 'MMMM d, yyyy')} at {format(new Date(audit.date), 'h:mm a')}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {(audit.status === 'draft' || audit.status === 'in_progress') && (
            <Button
              variant="primary"
              icon={Play}
              onClick={handleContinueAudit}
            >
              Continue Audit
            </Button>
          )}
          {audit.status === 'completed' && (
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
          )}
        </div>
      </div>

      {/* Score Card (for completed audits) */}
      {audit.status === 'completed' && audit.score !== null && (
        <Card className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <ScoreDisplay score={audit.score} size="lg" />
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Audit Score
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {audit.score >= 90 && 'Excellent! All safety standards met.'}
                {audit.score >= 80 && audit.score < 90 && 'Good performance with minor improvements needed.'}
                {audit.score >= 70 && audit.score < 80 && 'Satisfactory but improvements recommended.'}
                {audit.score >= 60 && audit.score < 70 && 'Below expectations. Action items required.'}
                {audit.score < 60 && 'Critical issues found. Immediate action required.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Audit Info */}
      <Card className="p-5">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Audit Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <MapPin size={20} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
              <p className="font-medium text-slate-900 dark:text-white">{audit.location || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <User size={20} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Auditor</p>
              <p className="font-medium text-slate-900 dark:text-white">{audit.createdBy || 'Unknown'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Clock size={20} className="text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Created</p>
              <p className="font-medium text-slate-900 dark:text-white">{format(new Date(audit.date), 'MMM d, yyyy')}</p>
            </div>
          </div>
          {audit.completedAt && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Completed</p>
                <p className="font-medium text-slate-900 dark:text-white">{format(new Date(audit.completedAt), 'MMM d, yyyy')}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Questions & Answers */}
      {template?.sections && (
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Audit Responses</h3>

          {template.sections.map((section, sectionIdx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIdx * 0.1 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-amazon-orange/10 to-amazon-teal/10 px-5 py-3 border-b border-slate-100 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    {sectionIdx + 1}. {section.title}
                  </h4>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {section.items.map((item, itemIdx) => {
                    const answer = audit.answers?.[item.id];
                    const note = audit.notes?.[item.id];

                    return (
                      <div key={item.id} className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-0.5">
                            {item.type === 'bool' ? (
                              getAnswerIcon(answer)
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
                                {itemIdx + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <p className="text-slate-900 dark:text-white">
                                {item.text}
                                {item.critical && (
                                  <span className="ml-2 inline-flex items-center gap-1 text-xs text-red-500">
                                    <AlertTriangle size={12} />
                                    Critical
                                  </span>
                                )}
                              </p>
                              <span className={`
                                text-sm font-medium flex-shrink-0
                                ${item.type === 'bool' && answer === 'pass' ? 'text-emerald-600 dark:text-emerald-400' : ''}
                                ${item.type === 'bool' && answer === 'fail' ? 'text-red-600 dark:text-red-400' : ''}
                                ${item.type === 'bool' && answer === 'na' ? 'text-slate-500' : ''}
                                ${!answer ? 'text-slate-400' : ''}
                                ${item.type !== 'bool' ? 'text-slate-700 dark:text-slate-300' : ''}
                              `}>
                                {getAnswerText(answer, item.type)}
                              </span>
                            </div>
                            {note && (
                              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                                Note: {note}
                              </p>
                            )}
                            {item.type === 'photo' && answer && (
                              <div className="mt-2">
                                <img
                                  src={answer}
                                  alt="Captured"
                                  className="w-32 h-32 object-cover rounded-lg"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Global Notes */}
      {audit.globalNotes && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Additional Notes</h3>
          <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{audit.globalNotes}</p>
        </Card>
      )}

      {/* Signature */}
      {audit.signature && (
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Auditor Signature</h3>
          <img
            src={audit.signature}
            alt="Signature"
            className="max-w-xs h-24 object-contain bg-slate-50 dark:bg-slate-800 rounded-lg p-2"
          />
        </Card>
      )}

      {/* Delete Section */}
      <Card className="p-5 border-red-200 dark:border-red-800">
        <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Once deleted, this audit cannot be recovered.
        </p>
        {showDeleteConfirm ? (
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              Yes, Delete
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
          >
            Delete Audit
          </Button>
        )}
      </Card>
    </div>
  );
}
