import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Camera, AlertTriangle, Star, ChevronDown, MinusCircle, Plus, Trash2, Image, ClipboardList, Users, Sparkles, Loader2, Shield, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi } from '../../utils/api';

const OWNER_OPTIONS = ['OPS', 'ACES', 'RME', 'WHS'];

export default function QuestionItem({
  question,
  value,
  onChange,
  onPhotoCapture,
  note,
  onNoteChange,
  photos = [],
  onAddPhoto,
  onRemovePhoto,
  onCreateAction,
  showActionButton = false,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showActionForm, setShowActionForm] = useState(false);
  const [actionData, setActionData] = useState({
    priority: 'medium',
    notes: '',
    owner: null,
  });

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  // Handle AI image analysis
  const handleAiAnalyze = async () => {
    if (!photos || photos.length === 0) {
      toast.error('No photo available to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      // Use the first/most recent photo for analysis
      const imageToAnalyze = photos[photos.length - 1];
      const response = await aiApi.analyzeImage(imageToAnalyze, question.text);

      if (response.success && response.data) {
        const analysis = response.data;
        setAiAnalysis(analysis);

        // If hazard detected with high severity, auto-suggest fail and update notes
        if (analysis.hazardDetected) {
          if (analysis.severity === 'high' && value !== 'fail') {
            // Suggest changing to fail for high severity hazards
            onChange('fail');
            toast('AI detected a high-severity hazard. Status changed to Fail.', {
              icon: '⚠️',
              duration: 4000,
            });
          } else if (analysis.severity === 'medium') {
            toast('AI detected a medium-severity hazard. Review recommended.', {
              icon: '⚠️',
              duration: 4000,
            });
          }

          // Auto-fill notes with AI description
          if (onNoteChange && analysis.description) {
            const aiNote = `[AI Analysis] ${analysis.description}${analysis.recommendation ? `\n\nRecommendation: ${analysis.recommendation}` : ''}`;
            onNoteChange(aiNote);
          }
        } else {
          toast.success('AI analysis complete - No hazards detected');
        }
      } else {
        throw new Error(response.error || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error(error.message || 'Failed to analyze image with AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCreateAction = () => {
    if (onCreateAction) {
      onCreateAction({
        questionId: question.id,
        questionText: question.text,
        priority: actionData.priority,
        notes: actionData.notes,
        owner: actionData.owner,
        critical: question.critical,
      });
      setShowActionForm(false);
      setActionData({ priority: 'medium', notes: '', owner: null });
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'bool':
      case 'yesno':
        return (
          <div className="flex gap-2">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange('pass')}
              className={`
                flex-1 py-3 px-4 rounded-xl font-medium transition-all
                flex items-center justify-center gap-2
                ${value === 'pass'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              <Check size={20} />
              <span className="hidden sm:inline">Safe</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange('fail')}
              className={`
                flex-1 py-3 px-4 rounded-xl font-medium transition-all
                flex items-center justify-center gap-2
                ${value === 'fail'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              <X size={20} />
              <span className="hidden sm:inline">Risk</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onChange('na')}
              className={`
                flex-1 py-3 px-4 rounded-xl font-medium transition-all
                flex items-center justify-center gap-2
                ${value === 'na'
                  ? 'bg-slate-500 text-white shadow-lg'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }
              `}
            >
              <MinusCircle size={20} />
              <span className="hidden sm:inline">N/A</span>
            </motion.button>
          </div>
        );

      case 'rating':
        return (
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((rating) => (
              <motion.button
                key={rating}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onChange(rating)}
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all
                  ${value >= rating
                    ? 'bg-amazon-orange text-white shadow-lg shadow-amazon-orange/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                <Star size={24} className={value >= rating ? 'fill-current' : ''} />
              </motion.button>
            ))}
          </div>
        );

      case 'options':
        return (
          <div className="grid grid-cols-2 gap-2">
            {question.options?.map((option) => (
              <motion.button
                key={option}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange(option)}
                className={`
                  py-3 px-4 rounded-xl font-medium text-sm transition-all text-left
                  ${value === option
                    ? 'bg-amazon-orange text-white shadow-lg shadow-amazon-orange/30'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }
                `}
              >
                {option}
              </motion.button>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            placeholder="Enter your notes..."
            className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-none resize-none focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />
        );

      case 'photo':
        return (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onPhotoCapture}
            className="w-full py-8 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amazon-orange hover:bg-amazon-orange/5 transition-all flex flex-col items-center gap-3"
          >
            <div className="w-14 h-14 rounded-full bg-amazon-orange/10 flex items-center justify-center">
              <Camera size={28} className="text-amazon-orange" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Tap to capture photo
            </span>
          </motion.button>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-start gap-3 text-left"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {question.critical && (
              <AlertTriangle size={16} className="text-amber-500" />
            )}
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {question.text}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {question.required && (
              <span className="text-xs text-red-500">Required</span>
            )}
            {photos && photos.length > 0 && (
              <span className="text-xs text-amazon-orange flex items-center gap-1">
                <Image size={12} />
                {photos.length} photo{photos.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          className="text-slate-400"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5"
          >
            {renderInput()}

            {/* Note field for failed items */}
            {value === 'fail' && (
              <div className="mt-4 animate-in fade-in">
                <label className="text-xs font-bold text-red-600 uppercase mb-2 block">
                  Describe the issue
                </label>
                <textarea
                  value={note || ''}
                  onChange={(e) => onNoteChange && onNoteChange(e.target.value)}
                  placeholder="Describe the problem..."
                  rows={2}
                  className="w-full text-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200 placeholder:text-red-300 dark:placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
            )}

            {/* Photo thumbnails */}
            {photos && photos.length > 0 && (
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">
                  Photos ({photos.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                      />
                      {onRemovePhoto && (
                        <button
                          onClick={() => onRemovePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis Results */}
            <AnimatePresence>
              {aiAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-4 p-4 rounded-xl border-2 ${
                    aiAnalysis.hazardDetected
                      ? aiAnalysis.severity === 'high'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                        : aiAnalysis.severity === 'medium'
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {aiAnalysis.hazardDetected ? (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          aiAnalysis.severity === 'high' ? 'bg-red-500' :
                          aiAnalysis.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}>
                          <Shield size={16} className="text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                          <Check size={16} className="text-white" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Sparkles size={12} />
                          AI Safety Analysis
                        </p>
                        <p className={`text-sm font-semibold ${
                          aiAnalysis.hazardDetected
                            ? aiAnalysis.severity === 'high' ? 'text-red-700 dark:text-red-300' :
                              aiAnalysis.severity === 'medium' ? 'text-amber-700 dark:text-amber-300' :
                              'text-blue-700 dark:text-blue-300'
                            : 'text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {aiAnalysis.hazardDetected
                            ? `Hazard Detected - ${aiAnalysis.severity?.toUpperCase()} Severity`
                            : 'No Hazards Detected'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAiAnalysis(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  {aiAnalysis.description && (
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                      {aiAnalysis.description}
                    </p>
                  )}

                  {aiAnalysis.recommendation && (
                    <div className="mt-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                      <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
                        Recommendation
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {aiAnalysis.recommendation}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className={`px-2 py-0.5 rounded-full ${
                      aiAnalysis.complianceStatus === 'compliant'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : aiAnalysis.complianceStatus === 'non-compliant'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      {aiAnalysis.complianceStatus?.replace('-', ' ')}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <span>Confidence: {aiAnalysis.confidence}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons row */}
            <div className="mt-4 flex flex-wrap gap-2">
              {/* Add Photo button */}
              {onAddPhoto && question.type !== 'photo' && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onAddPhoto}
                  className="flex-1 min-w-[120px] py-2.5 px-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amazon-orange hover:bg-amazon-orange/5 transition-all flex items-center justify-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400"
                >
                  <Camera size={18} />
                  <span>Add Photo</span>
                </motion.button>
              )}

              {/* AI Analyze button - only visible if photo exists */}
              {photos && photos.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAiAnalyze}
                  disabled={isAnalyzing}
                  className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                    isAnalyzing
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 cursor-wait'
                      : aiAnalysis
                      ? aiAnalysis.hazardDetected
                        ? 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100'
                        : 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100'
                      : 'border-dashed border-purple-300 dark:border-purple-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>AI Analyze</span>
                    </>
                  )}
                </motion.button>
              )}

              {/* Create Action button */}
              {showActionButton && onCreateAction && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowActionForm(!showActionForm)}
                  className={`flex-1 py-2.5 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                    showActionForm
                      ? 'border-amazon-orange bg-amazon-orange/10 text-amazon-orange'
                      : 'border-dashed border-slate-300 dark:border-slate-600 hover:border-amazon-orange hover:bg-amazon-orange/5 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <ClipboardList size={18} />
                  <span>Create Action</span>
                </motion.button>
              )}
            </div>

            {/* Action creation form */}
            <AnimatePresence>
              {showActionForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 p-4 bg-amazon-orange/5 border border-amazon-orange/20 rounded-xl space-y-3"
                >
                  <div className="text-xs font-bold text-amazon-orange uppercase">
                    New Action
                  </div>

                  {/* Priority selection */}
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                      Priority
                    </label>
                    <div className="flex gap-2">
                      {['low', 'medium', 'high'].map((priority) => (
                        <button
                          key={priority}
                          onClick={() => setActionData(prev => ({ ...prev, priority }))}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all ${
                            actionData.priority === priority
                              ? priority === 'high'
                                ? 'bg-red-500 text-white'
                                : priority === 'medium'
                                ? 'bg-amber-500 text-white'
                                : 'bg-blue-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Owner selection */}
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block flex items-center gap-1">
                      <Users size={12} />
                      Owner Team
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setActionData(prev => ({ ...prev, owner: null }))}
                        className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                          actionData.owner === null
                            ? 'bg-amazon-orange text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        None
                      </button>
                      {OWNER_OPTIONS.map((owner) => (
                        <button
                          key={owner}
                          onClick={() => setActionData(prev => ({ ...prev, owner }))}
                          className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                            actionData.owner === owner
                              ? 'bg-amazon-orange text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {owner}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                      Description
                    </label>
                    <textarea
                      value={actionData.notes}
                      onChange={(e) => setActionData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Describe what action needs to be taken..."
                      rows={2}
                      className="w-full text-sm p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amazon-orange/50"
                    />
                  </div>

                  {/* Submit buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowActionForm(false);
                        setActionData({ priority: 'medium', notes: '', owner: null });
                      }}
                      className="flex-1 py-2 px-4 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateAction}
                      className="flex-1 py-2 px-4 rounded-lg bg-amazon-orange text-white text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Create Action
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
