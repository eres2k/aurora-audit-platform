import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  FileText,
  Download,
  Trash2,
  X,
  User,
  Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import Progress from '../ui/Progress';
import { useAudits } from '../../context/AuditContext';
import { generateAuditPDF } from '../../utils/pdfExport';

export default function AuditCard({ audit, index = 0 }) {
  const navigate = useNavigate();
  const { templates, deleteAudit } = useAudits();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleClick = () => {
    if (audit.status === 'completed') {
      navigate(`/audits/${audit.id}`);
    } else {
      // Draft or in_progress - continue the audit
      navigate(`/audits/${audit.id}/continue`);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAudit(audit.id);
      toast.success('Audit deleted successfully');
      setShowDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete audit');
      console.error('Delete audit error:', error);
    }
  };

  const handleExportPDF = (e) => {
    e.stopPropagation();
    const template = templates.find(t => t.id === audit.templateId);
    try {
      const filename = generateAuditPDF(audit, template);
      toast.success(`Downloaded ${filename}`);
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF export error:', error);
    }
  };

  const statusConfig = {
    draft: { label: 'Draft', variant: 'default', icon: FileText },
    in_progress: { label: 'In Progress', variant: 'warning', icon: Clock },
    completed: { label: 'Completed', variant: 'success', icon: CheckCircle },
    failed: { label: 'Failed', variant: 'danger', icon: AlertTriangle },
  };

  const status = statusConfig[audit.status] || statusConfig.draft;
  const StatusIcon = status.icon;

  const getScoreColor = (score) => {
    if (!score) return 'text-slate-400';
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const getGrade = (score) => {
    if (!score) return '-';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleClick}
      className="card p-4 cursor-pointer hover:border-amazon-orange/50 transition-all group"
    >
      <div className="flex items-start gap-4">
        {/* Score Circle */}
        <div className={`relative w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center ${getScoreColor(audit.score)}`}>
          {audit.score ? (
            <>
              <span className="text-2xl font-bold">{getGrade(audit.score)}</span>
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${audit.score * 1.76} 176`}
                  className="opacity-30"
                />
              </svg>
            </>
          ) : (
            <StatusIcon size={28} className="text-slate-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amazon-teal/10 text-amazon-teal text-xs font-bold">
                <Hash size={12} />
                {audit.shortId || audit.id.slice(-8).toUpperCase()}
              </span>
            </div>
            <Badge variant={status.variant} size="sm">
              {status.label}
            </Badge>
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white truncate mb-2">
            {audit.templateTitle || 'Audit'}
          </h3>

          <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
            {audit.createdBy && (
              <div className="flex items-center gap-2">
                <User size={16} className="text-amazon-orange" />
                <span className="font-medium text-slate-700 dark:text-slate-300">{audit.createdBy}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{format(new Date(audit.date), 'MMM d, yyyy h:mm a')}</span>
            </div>
            {audit.location && (
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                <span className="truncate">{audit.location}</span>
              </div>
            )}
          </div>

          {audit.status === 'in_progress' && (
            <div className="mt-3">
              <Progress
                value={Object.keys(audit.answers || {}).length}
                max={20}
                size="sm"
                color="primary"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {audit.status === 'completed' && (
            <button
              onClick={handleExportPDF}
              className="p-2 rounded-lg text-slate-400 hover:text-amazon-orange hover:bg-amazon-orange/10 transition-all"
              title="Export PDF"
            >
              <Download size={18} />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Delete Audit"
          >
            <Trash2 size={18} />
          </button>
          <ChevronRight size={20} className="text-slate-400 group-hover:text-amazon-orange group-hover:translate-x-1 transition-all" />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Delete Audit
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This action cannot be undone
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(false);
                  }}
                  className="ml-auto p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Are you sure you want to delete <strong>"{audit.templateTitle}"</strong>?
                {audit.status === 'completed' && (
                  <span className="block mt-2 text-sm text-amber-600 dark:text-amber-400">
                    This is a completed audit with a score of {audit.score}%.
                  </span>
                )}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(false);
                  }}
                  className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmDelete();
                  }}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
