import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Check,
  Save,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAudits } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Progress } from '../components/ui';
import { QuestionItem, SignaturePad, ScoreDisplay, PhotoCapture } from '../components/audit';

export default function NewAudit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateIdFromUrl = searchParams.get('template');

  const { templates, createAudit, updateAudit, completeAudit } = useAudits();
  const { selectedStation } = useAuth();

  const [step, setStep] = useState(templateIdFromUrl ? 'audit' : 'select');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [audit, setAudit] = useState(null);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [globalNotes, setGlobalNotes] = useState('');
  const [signature, setSignature] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentPhotoQuestion, setCurrentPhotoQuestion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  useEffect(() => {
    if (templateIdFromUrl) {
      const template = templates.find(t => t.id === templateIdFromUrl);
      if (template) {
        handleTemplateSelect(template);
      }
    }
  }, [templateIdFromUrl, templates]);

  const handleTemplateSelect = async (template) => {
    setSelectedTemplate(template);
    try {
      const newAudit = await createAudit(template.id);
      setAudit(newAudit);
      setStep('audit');
    } catch (error) {
      toast.error('Failed to create audit');
    }
  };

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    // Clear note if changed from fail
    if (value !== 'fail' && notes[questionId]) {
      setNotes(prev => {
        const newNotes = { ...prev };
        delete newNotes[questionId];
        return newNotes;
      });
    }
  };

  const handleNoteChange = (questionId, value) => {
    setNotes(prev => ({ ...prev, [questionId]: value }));
  };

  const handlePhotoCapture = (questionId) => {
    setCurrentPhotoQuestion(questionId);
    setShowCamera(true);
  };

  const handlePhotoCaptured = (dataUrl) => {
    setAnswers(prev => ({ ...prev, [currentPhotoQuestion]: dataUrl }));
    setShowCamera(false);
    setCurrentPhotoQuestion(null);
  };

  const handleSignatureSave = (dataUrl) => {
    setSignature(dataUrl);
  };

  const handleNext = () => {
    if (currentSection < selectedTemplate.sections.length - 1) {
      setCurrentSection(prev => prev + 1);
    } else {
      setStep('review');
    }
  };

  const handlePrev = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    } else {
      setStep('select');
      setSelectedTemplate(null);
      setAudit(null);
      setAnswers({});
      setNotes({});
    }
  };

  const handleSaveDraft = async () => {
    try {
      await updateAudit(audit.id, {
        answers,
        notes,
        globalNotes,
        status: 'in_progress',
      });
      toast.success('Progress saved');
      navigate('/audits');
    } catch (error) {
      toast.error('Failed to save');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const score = await completeAudit(audit.id, {
        answers,
        notes,
        globalNotes,
        signature,
      });
      setFinalScore(score);
      toast.success('Audit completed successfully!');
      setStep('complete');
    } catch (error) {
      toast.error('Failed to complete audit');
    }
    setIsSubmitting(false);
  };

  const currentSectionData = selectedTemplate?.sections?.[currentSection];
  const progress = selectedTemplate
    ? ((currentSection + 1) / selectedTemplate.sections.length) * 100
    : 0;

  const calculateCurrentScore = () => {
    if (!selectedTemplate) return 0;
    let total = 0;
    let passed = 0;
    let na = 0;

    selectedTemplate.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.type === 'bool') {
          total++;
          if (answers[item.id] === 'pass') passed++;
          if (answers[item.id] === 'na') na++;
        }
      });
    });

    const scorable = total - na;
    if (scorable === 0) return 100;
    return Math.round((passed / scorable) * 100);
  };

  // Template Selection
  if (step === 'select') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          />
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              New Audit
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Select a template to get started
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleTemplateSelect(template)}
              className="cursor-pointer"
            >
              <Card hover className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${template.color}20` }}
                  >
                    <Clock size={28} style={{ color: template.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {template.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>~{template.estimatedTime} min</span>
                      <span>-</span>
                      <span>{template.sections?.length} sections</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Audit Form
  if (step === 'audit' && selectedTemplate && currentSectionData) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowLeft}
              onClick={handlePrev}
            />
            <div>
              <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                {selectedTemplate.title}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Section {currentSection + 1} of {selectedTemplate.sections.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedStation && (
              <div className="flex items-center gap-1 text-sm text-slate-500 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <MapPin size={14} />
                <span>{selectedStation}</span>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">Score</p>
              <p className={`text-xl font-bold ${calculateCurrentScore() >= 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                {calculateCurrentScore()}%
              </p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <Progress value={progress} max={100} color="gradient" showLabel />

        {/* Section Title */}
        <div className="bg-gradient-to-r from-amazon-orange/10 to-amazon-teal/10 rounded-2xl p-5">
          <h2 className="text-lg font-display font-semibold text-slate-900 dark:text-white">
            {currentSectionData.title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {currentSectionData.items.length} questions
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {currentSectionData.items.map((question) => (
            <QuestionItem
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => handleAnswer(question.id, value)}
              onPhotoCapture={() => handlePhotoCapture(question.id)}
              note={notes[question.id]}
              onNoteChange={(value) => handleNoteChange(question.id, value)}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={handlePrev}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            variant="primary"
            icon={currentSection === selectedTemplate.sections.length - 1 ? Check : ArrowRight}
            iconPosition="right"
            onClick={handleNext}
            className="flex-1"
          >
            {currentSection === selectedTemplate.sections.length - 1 ? 'Review' : 'Next'}
          </Button>
        </div>

        {/* Photo Capture Modal */}
        <AnimatePresence>
          {showCamera && (
            <PhotoCapture
              onCapture={handlePhotoCaptured}
              onClose={() => setShowCamera(false)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Review
  if (step === 'review') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={() => setStep('audit')}
          />
          <div>
            <h1 className="text-xl font-display font-bold text-slate-900 dark:text-white">
              Review & Submit
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Review your responses before submitting
            </p>
          </div>
        </div>

        {/* Score Preview */}
        <Card className="text-center py-8">
          <ScoreDisplay score={calculateCurrentScore()} size="lg" />
        </Card>

        {/* Global Notes */}
        <Card>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">
            Additional Notes
          </h3>
          <textarea
            value={globalNotes}
            onChange={(e) => setGlobalNotes(e.target.value)}
            placeholder="Add any additional observations or notes..."
            rows={3}
            className="input-field resize-none"
          />
        </Card>

        {/* Signature */}
        <Card>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
            Digital Signature
          </h3>
          {signature ? (
            <div className="space-y-3">
              <img
                src={signature}
                alt="Signature"
                className="w-full h-32 object-contain bg-slate-50 dark:bg-slate-900 rounded-xl"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSignature(null)}
              >
                Re-sign
              </Button>
            </div>
          ) : (
            <SignaturePad
              onSave={handleSignatureSave}
              onCancel={() => {}}
            />
          )}
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={Save}
            onClick={handleSaveDraft}
            className="flex-1"
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            icon={Check}
            loading={isSubmitting}
            onClick={handleSubmit}
            className="flex-1"
          >
            Submit Audit
          </Button>
        </div>
      </div>
    );
  }

  // Complete
  if (step === 'complete') {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6"
        >
          <Check size={48} className="text-white" />
        </motion.div>

        <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-2">
          Audit Complete!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Your audit has been submitted successfully.
        </p>

        <Card className="mb-8">
          <ScoreDisplay score={finalScore} />
        </Card>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate('/audits')}
            className="flex-1"
          >
            View All Audits
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setStep('select');
              setSelectedTemplate(null);
              setAudit(null);
              setAnswers({});
              setNotes({});
              setGlobalNotes('');
              setSignature(null);
              setCurrentSection(0);
              setFinalScore(null);
            }}
            className="flex-1"
          >
            New Audit
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
