import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Sparkles,
  Loader2,
  Shield,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAudits } from '../context/AuditContext';
import { Button, Card, Badge } from '../components/ui';
import { ScoreDisplay } from '../components/audit';
import { generateAuditPDF } from '../utils/pdfExport';
import { aiApi } from '../utils/api';

export default function AuditDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { audits, templates, actions } = useAudits();

  // Insights state
  const [insights, setInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  // Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [includeAIInsights, setIncludeAIInsights] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const audit = audits.find(a => a.id === id);
  const template = audit ? templates.find(t => t.id === audit.templateId) : null;
  const auditActions = actions.filter(a => a.auditId === id);

  // Generate Insights Summary
  const handleGenerateInsights = async () => {
    if (!audit) return;

    setIsLoadingInsights(true);
    try {
      const response = await aiApi.summarizeAudit(audit, template);
      if (response.success && response.data) {
        setInsights(response.data);
        toast.success('Insights generated successfully');
      } else {
        throw new Error(response.error || 'Failed to generate insights');
      }
    } catch (error) {
      console.error('Insights error:', error);
      toast.error(error.message || 'Failed to generate insights');
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      let pdfInsights = null;

      // Generate AI insights if requested
      if (includeAIInsights) {
        toast.loading('Generating AI insights...', { id: 'pdf-export' });
        const response = await aiApi.generatePDFInsights(audit, template);
        if (response.success && response.data) {
          pdfInsights = response.data;
        }
      }

      const filename = generateAuditPDF(audit, template, auditActions, {
        includeAIInsights,
        aiInsights: pdfInsights,
      });
      toast.success(`Downloaded ${filename}`, { id: 'pdf-export' });
      setShowExportDialog(false);
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdf-export' });
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleQuickExport = () => {
    try {
      const filename = generateAuditPDF(audit, template, auditActions);
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
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={isLoadingInsights ? Loader2 : Sparkles}
            onClick={handleGenerateInsights}
            disabled={isLoadingInsights}
            className={isLoadingInsights ? 'animate-pulse' : ''}
          >
            {isLoadingInsights ? 'Analyzing...' : 'Insights'}
          </Button>
          <Button
            variant="primary"
            icon={Download}
            onClick={() => setShowExportDialog(true)}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Export PDF Dialog */}
      <AnimatePresence>
        {showExportDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowExportDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amazon-orange to-amazon-teal flex items-center justify-center">
                    <FileText size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Export Audit Report
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Customize your PDF export
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportDialog(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              {/* Export Options */}
              <div className="space-y-4 mb-6">
                <label className="flex items-start gap-4 p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-amazon-orange/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={includeAIInsights}
                    onChange={(e) => setIncludeAIInsights(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded border-slate-300 text-amazon-orange focus:ring-amazon-orange"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Sparkles size={18} className="text-purple-500" />
                      <span className="font-medium text-slate-900 dark:text-white">
                        Include AI Audit Insights
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Add AI-generated summary, findings, recommendations, and risk analysis to your report
                    </p>
                  </div>
                </label>
              </div>

              {/* Export Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={handleQuickExport}
                  className="flex-1"
                >
                  Quick Export
                </Button>
                <Button
                  variant="primary"
                  icon={isExporting ? Loader2 : Download}
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="flex-1"
                >
                  {isExporting ? 'Generating...' : 'Export PDF'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AuditHub Insights */}
      <AnimatePresence>
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="overflow-hidden border-2 border-purple-200 dark:border-purple-800">
              {/* Summary Header */}
              <button
                onClick={() => setSummaryExpanded(!summaryExpanded)}
                className="w-full bg-gradient-to-r from-purple-500/10 via-amazon-orange/10 to-amazon-teal/10 px-6 py-4 border-b border-purple-200 dark:border-purple-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-amazon-orange flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      AuditHub Insights
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Executive Summary
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      insights.overallStatus === 'PASS' ? 'success' :
                      insights.overallStatus === 'CRITICAL' ? 'danger' : 'warning'
                    }
                    size="sm"
                  >
                    {insights.overallStatus}
                  </Badge>
                  {insights.complianceScore && (
                    <span className="text-2xl font-bold text-amazon-orange">
                      {insights.complianceScore}
                    </span>
                  )}
                  {summaryExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                </div>
              </button>

              {/* Summary Content */}
              <AnimatePresence>
                {summaryExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="divide-y divide-slate-100 dark:divide-slate-800"
                  >
                    {/* Executive Summary */}
                    <div className="p-6">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {insights.executiveSummary}
                      </p>
                    </div>

                    {/* Key Risks */}
                    {insights.keyRisks && insights.keyRisks.length > 0 && (
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Shield size={18} className="text-red-500" />
                          <h4 className="font-semibold text-slate-900 dark:text-white">Key Risks</h4>
                        </div>
                        <div className="space-y-3">
                          {insights.keyRisks.map((risk, index) => (
                            <div
                              key={index}
                              className={`p-4 rounded-xl border-l-4 ${
                                risk.severity === 'high'
                                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                  : risk.severity === 'medium'
                                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-500'
                                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm text-slate-700 dark:text-slate-300">{risk.risk}</p>
                                <Badge
                                  variant={risk.severity === 'high' ? 'danger' : risk.severity === 'medium' ? 'warning' : 'info'}
                                  size="sm"
                                >
                                  {risk.severity}
                                </Badge>
                              </div>
                              {risk.area && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  Area: {risk.area}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {insights.recommendations && insights.recommendations.length > 0 && (
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Lightbulb size={18} className="text-amazon-orange" />
                          <h4 className="font-semibold text-slate-900 dark:text-white">Recommendations</h4>
                        </div>
                        <div className="space-y-3">
                          {insights.recommendations.map((rec, index) => (
                            <div
                              key={index}
                              className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                            >
                              <div className="flex items-start gap-3">
                                <Badge
                                  variant={
                                    rec.priority === 'immediate' ? 'danger' :
                                    rec.priority === 'short-term' ? 'warning' : 'info'
                                  }
                                  size="sm"
                                  className="shrink-0 mt-0.5"
                                >
                                  {rec.priority}
                                </Badge>
                                <div>
                                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                                    {rec.action}
                                  </p>
                                  {rec.impact && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                      Impact: {rec.impact}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Positive Findings */}
                    {insights.positiveFindings && insights.positiveFindings.length > 0 && (
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp size={18} className="text-emerald-500" />
                          <h4 className="font-semibold text-slate-900 dark:text-white">Positive Findings</h4>
                        </div>
                        <ul className="space-y-2">
                          {insights.positiveFindings.map((finding, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                              <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                              {finding}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

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
