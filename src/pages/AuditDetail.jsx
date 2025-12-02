import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Download,
  MapPin,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Image,
  ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAudits } from '../context/AuditContext';
import { Button, Card, Badge } from '../components/ui';
import { ScoreDisplay } from '../components/audit';
import { generateAuditPDF } from '../utils/pdfExport';

export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { audits, templates, actions } = useAudits();

  const audit = audits.find(a => a.id === id);
  const template = audit ? templates.find(t => t.id === audit.templateId) : null;
  const auditActions = actions.filter(a => a.auditId === id);

  const handleExportPDF = () => {
    try {
      const filename = generateAuditPDF(audit, template, actions);
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF export error:', error);
    }
  };

  if (!audit) {
    return (
      <div className="text-center py-16">
        <FileText size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Audit not found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          The audit you're looking for doesn't exist or has been deleted.
        </p>
        <Button variant="primary" onClick={() => navigate('/audits')}>
          Back to Audits
        </Button>
      </div>
    );
  }

  const getAnswerDisplay = (answer, type) => {
    if (type === 'bool') {
      if (answer === 'pass') return { text: 'Pass', icon: CheckCircle, color: 'text-emerald-500' };
      if (answer === 'fail') return { text: 'Fail', icon: XCircle, color: 'text-red-500' };
      if (answer === 'na') return { text: 'N/A', icon: null, color: 'text-slate-400' };
      return { text: '-', icon: null, color: 'text-slate-400' };
    }
    if (type === 'rating') {
      return { text: answer ? `${answer}/5` : '-', icon: null, color: 'text-slate-700 dark:text-slate-300' };
    }
    return { text: answer || '-', icon: null, color: 'text-slate-700 dark:text-slate-300' };
  };

  const hasCriticalFailed = template?.sections?.some(section =>
    section.items.some(item =>
      item.critical && audit.answers?.[item.id] === 'fail'
    )
  );

  return (
    <div className="space-y-6">
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
            <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
              {audit.templateTitle || 'Audit Report'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Completed {format(new Date(audit.completedAt || audit.date), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          icon={Download}
          onClick={handleExportPDF}
        >
          Export PDF
        </Button>
      </div>

      {/* Score and Details */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Score Card */}
        <Card className="p-6 text-center">
          <ScoreDisplay score={audit.score} size="lg" criticalFailed={hasCriticalFailed} />
        </Card>

        {/* Info Cards */}
        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Audit Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amazon-orange/10 flex items-center justify-center">
                <User size={20} className="text-amazon-orange" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Auditor</p>
                <p className="font-medium text-slate-900 dark:text-white">{audit.createdBy || 'Unknown'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amazon-teal/10 flex items-center justify-center">
                <MapPin size={20} className="text-amazon-teal" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Location</p>
                <p className="font-medium text-slate-900 dark:text-white">{audit.location || 'Not specified'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Calendar size={20} className="text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Date</p>
                <p className="font-medium text-slate-900 dark:text-white">{format(new Date(audit.date), 'MMM d, yyyy')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Clock size={20} className="text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-medium">Template</p>
                <p className="font-medium text-slate-900 dark:text-white">{template?.category || 'General'}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Questions and Answers */}
      {template?.sections?.map((section, sectionIndex) => (
        <Card key={section.id || sectionIndex} className="overflow-hidden">
          <div className="bg-gradient-to-r from-amazon-orange/10 to-amazon-teal/10 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {sectionIndex + 1}. {section.title}
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {section.items.map((item, itemIndex) => {
              const answer = audit.answers?.[item.id];
              const answerDisplay = getAnswerDisplay(answer, item.type);
              const note = audit.notes?.[item.id];
              const photos = audit.questionPhotos?.[item.id] || [];
              const AnswerIcon = answerDisplay.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: itemIndex * 0.02 }}
                  className={`p-4 ${answer === 'fail' ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 dark:text-slate-500 text-sm font-medium min-w-[24px]">
                          {itemIndex + 1}.
                        </span>
                        <p className="text-slate-900 dark:text-white">
                          {item.text}
                        </p>
                      </div>
                      {item.critical && (
                        <Badge variant="danger" size="sm" className="ml-7 mt-2">
                          <AlertTriangle size={12} className="mr-1" />
                          Critical
                        </Badge>
                      )}
                      {note && (
                        <p className="ml-7 mt-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                          {note}
                        </p>
                      )}
                      {/* Display photos */}
                      {photos.length > 0 && (
                        <div className="ml-7 mt-3">
                          <div className="flex items-center gap-1 text-xs text-amazon-orange font-medium mb-2">
                            <Image size={14} />
                            <span>{photos.length} photo{photos.length > 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {photos.map((photo, photoIndex) => (
                              <img
                                key={photoIndex}
                                src={photo}
                                alt={`Photo ${photoIndex + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 font-semibold ${answerDisplay.color}`}>
                      {AnswerIcon && <AnswerIcon size={20} />}
                      <span>{answerDisplay.text}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* Actions */}
      {auditActions.length > 0 && (
        <Card className="overflow-hidden">
          <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-200 dark:border-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList size={20} className="text-red-500" />
              <h3 className="font-semibold text-red-700 dark:text-red-300">
                Actions ({auditActions.length})
              </h3>
            </div>
            <Link to="/actions">
              <Button variant="ghost" size="sm">View All Actions</Button>
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditActions.map((action) => (
              <div key={action.id} className="p-4 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {action.questionText || action.title}
                  </p>
                  {action.notes && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {action.notes}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                    <Badge
                      variant={action.priority === 'high' ? 'danger' : action.priority === 'medium' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {action.priority}
                    </Badge>
                    <Badge
                      variant={action.status === 'completed' ? 'success' : action.status === 'in_progress' ? 'warning' : 'danger'}
                      size="sm"
                    >
                      {action.status?.replace('_', ' ')}
                    </Badge>
                    {action.dueDate && (
                      <span>Due {format(new Date(action.dueDate), 'MMM d')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Global Notes */}
      {audit.globalNotes && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Additional Notes</h3>
          <p className="text-slate-600 dark:text-slate-400">{audit.globalNotes}</p>
        </Card>
      )}

      {/* Signature */}
      {audit.signature && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Auditor Signature</h3>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 inline-block">
            <img
              src={audit.signature}
              alt="Auditor signature"
              className="max-h-24 w-auto"
            />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Signed by {audit.createdBy} on {format(new Date(audit.completedAt || audit.date), 'MMM d, yyyy h:mm a')}
          </p>
        </Card>
      )}
    </div>
  );
}
