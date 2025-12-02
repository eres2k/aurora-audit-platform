import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  FileText,
  Download,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import Progress from '../ui/Progress';
import { useAudits } from '../../context/AuditContext';
import { generateAuditPDF } from '../../utils/pdfExport';

export default function AuditCard({ audit, index = 0 }) {
  const navigate = useNavigate();
  const { templates } = useAudits();

  const handleClick = () => {
    if (audit.status === 'completed') {
      navigate(`/audits/${audit.id}`);
    } else {
      // Draft or in_progress - continue the audit
      navigate(`/audits/${audit.id}/continue`);
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
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
              {audit.templateTitle || 'Audit'}
            </h3>
            <Badge variant={status.variant} size="sm">
              {status.label}
            </Badge>
          </div>

          <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400">
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
          <ChevronRight size={20} className="text-slate-400 group-hover:text-amazon-orange group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </motion.div>
  );
}
