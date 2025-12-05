import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Check,
  Save,
  Clock,
  Building2,
  ClipboardList,
  Mic,
  Square,
  Loader2,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAudits } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Progress, Badge } from '../components/ui';
import { QuestionItem, SignaturePad, ScoreDisplay, PhotoCapture } from '../components/audit';
import { aiApi } from '../utils/api';

// Check if Web Speech API is available
const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

export default function NewAudit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: auditIdFromUrl } = useParams();
  const templateIdFromUrl = searchParams.get('template');

  const { audits, templates, createAudit, updateAudit, completeAudit, createAction } = useAudits();
  const { selectedStation, stations } = useAuth();

  const [step, setStep] = useState(templateIdFromUrl ? 'station' : 'select');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [auditStation, setAuditStation] = useState(selectedStation || '');
  const [currentSection, setCurrentSection] = useState(0);
  const [audit, setAudit] = useState(null);
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [questionPhotos, setQuestionPhotos] = useState({}); // { questionId: [photoDataUrl, ...] }
  const [globalNotes, setGlobalNotes] = useState('');
  const [signature, setSignature] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [currentPhotoQuestion, setCurrentPhotoQuestion] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [auditActions, setAuditActions] = useState([]); // Actions created during this audit

  // Voice Recording state for global notes
  const [isRecordingNotes, setIsRecordingNotes] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [notesTranscript, setNotesTranscript] = useState('');
  const recognitionRef = useRef(null);

  // Load existing audit if continuing
  useEffect(() => {
    if (auditIdFromUrl && audits.length > 0 && templates.length > 0) {
      const existingAudit = audits.find(a => a.id === auditIdFromUrl);
      if (existingAudit && existingAudit.status !== 'completed') {
        const template = templates.find(t => t.id === existingAudit.templateId);
        if (template) {
          setAudit(existingAudit);
          setSelectedTemplate(template);
          setAuditStation(existingAudit.location || selectedStation || '');
          setAnswers(existingAudit.answers || {});
          setNotes(existingAudit.notes || {});
          setQuestionPhotos(existingAudit.questionPhotos || {});
          setGlobalNotes(existingAudit.globalNotes || '');
          setSignature(existingAudit.signature || null);
          setStep('audit');
        }
      } else if (existingAudit && existingAudit.status === 'completed') {
        // Redirect to detail view if audit is completed
        navigate(`/audits/${auditIdFromUrl}`, { replace: true });
      }
    }
  }, [auditIdFromUrl, audits, templates, selectedStation, navigate]);

  useEffect(() => {
    if (templateIdFromUrl && !auditIdFromUrl) {
      const template = templates.find(t => t.id === templateIdFromUrl);
      if (template) {
        setSelectedTemplate(template);
        setStep('station');
      }
    }
  }, [templateIdFromUrl, templates, auditIdFromUrl]);

  // Initialize speech recognition for global notes
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          }
        }
        setNotesTranscript(prev => prev + finalTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecordingNotes(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access.');
        } else if (event.error !== 'aborted') {
          toast.error('Voice recognition error. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecordingNotes(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Start voice recording for notes
  const startNotesRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error('Voice input is not supported in this browser. Try Chrome.');
      return;
    }

    setNotesTranscript('');
    setIsRecordingNotes(true);

    try {
      recognitionRef.current.start();
      toast('Listening... Speak now', { icon: '🎤', duration: 2000 });
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsRecordingNotes(false);
      toast.error('Failed to start voice input');
    }
  };

  // Stop voice recording and process with AI
  const stopNotesRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecordingNotes(false);

    if (!notesTranscript.trim()) {
      toast.error('No speech detected. Please try again.');
      return;
    }

    setIsProcessingVoice(true);

    try {
      const response = await aiApi.processVoiceNote(notesTranscript, 'Audit additional notes and observations');

      if (response.success && response.data) {
        const result = response.data;
        // Append cleaned note to existing global notes
        const cleanedNote = result.cleanedNote || notesTranscript;
        setGlobalNotes(prev => prev ? `${prev}\n\n${cleanedNote}` : cleanedNote);
        toast.success('Voice note processed and added!');
      } else {
        // Fallback: just append raw transcript
        setGlobalNotes(prev => prev ? `${prev}\n\n${notesTranscript}` : notesTranscript);
        toast('Added raw transcript', { icon: '⚠️' });
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      // Still save the raw transcript
      setGlobalNotes(prev => prev ? `${prev}\n\n${notesTranscript}` : notesTranscript);
      toast('Added raw transcript (processing failed)', { icon: '⚠️' });
    } finally {
      setIsProcessingVoice(false);
      setNotesTranscript('');
    }
  };

  // Cancel notes recording
  const cancelNotesRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsRecordingNotes(false);
    setNotesTranscript('');
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setStep('station');
  };

  const handleStationSelect = async () => {
    if (!auditStation) {
      toast.error('Please select a station');
      return;
    }
    try {
      const newAudit = await createAudit(selectedTemplate.id, auditStation);
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
    // For photo type questions, set as answer
    const question = selectedTemplate?.sections
      ?.flatMap(s => s.items)
      ?.find(q => q.id === currentPhotoQuestion);

    if (question?.type === 'photo') {
      setAnswers(prev => ({ ...prev, [currentPhotoQuestion]: dataUrl }));
    } else {
      // For other question types, add to questionPhotos array
      setQuestionPhotos(prev => ({
        ...prev,
        [currentPhotoQuestion]: [...(prev[currentPhotoQuestion] || []), dataUrl],
      }));
    }
    setShowCamera(false);
    setCurrentPhotoQuestion(null);
  };

  const handleRemovePhoto = (questionId, photoIndex) => {
    setQuestionPhotos(prev => ({
      ...prev,
      [questionId]: prev[questionId].filter((_, i) => i !== photoIndex),
    }));
  };

  const handleCreateActionForQuestion = async (actionData) => {
    try {
      const newAction = await createAction({
        auditId: audit?.id,
        questionId: actionData.questionId,
        questionText: actionData.questionText,
        priority: actionData.critical ? 'high' : actionData.priority,
        notes: actionData.notes,
        owner: actionData.owner,
        location: auditStation,
      });
      setAuditActions(prev => [...prev, newAction]);
      toast.success('Action created successfully');
    } catch (error) {
      toast.error('Failed to create action');
    }
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
    } else if (auditIdFromUrl) {
      // If continuing an existing audit, go back to audits list
      navigate('/audits');
    } else {
      setStep('station');
    }
  };

  const handleBackToTemplates = () => {
    setStep('select');
    setSelectedTemplate(null);
    setAudit(null);
    setAnswers({});
    setNotes({});
    setQuestionPhotos({});
    setAuditActions([]);
    setAuditStation(selectedStation || '');
  };

  const handleSaveDraft = async () => {
    try {
      await updateAudit(audit.id, {
        answers,
        notes,
        questionPhotos,
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
        questionPhotos,
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

  // Station Selection
  if (step === 'station' && selectedTemplate) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowLeft}
            onClick={handleBackToTemplates}
          />
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white">
              Select Station
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Choose the station where this audit will be conducted
            </p>
          </div>
        </div>

        {/* Selected Template Info */}
        <Card className="p-4 bg-gradient-to-r from-amazon-orange/10 to-amazon-teal/10">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${selectedTemplate.color}20` }}
            >
              <Clock size={24} style={{ color: selectedTemplate.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {selectedTemplate.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {selectedTemplate.sections?.length} sections • ~{selectedTemplate.estimatedTime} min
              </p>
            </div>
          </div>
        </Card>

        {/* Station Selection */}
        <Card className="p-5">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 size={20} />
            Available Stations
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {stations.map((station) => (
              <button
                key={station.id}
                onClick={() => setAuditStation(station.id)}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${auditStation === station.id
                    ? 'border-amazon-orange bg-amazon-orange/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-amazon-orange/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${station.color} flex items-center justify-center`}>
                    <MapPin size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {station.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {station.fullName}
                    </p>
                  </div>
                  {auditStation === station.id && (
                    <Check size={20} className="ml-auto text-amazon-orange" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Continue Button */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={handleBackToTemplates}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            variant="primary"
            icon={ArrowRight}
            iconPosition="right"
            onClick={handleStationSelect}
            disabled={!auditStation}
            className="flex-1"
          >
            Start Audit
          </Button>
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
            {auditStation && (
              <div className="flex items-center gap-1 text-sm text-slate-500 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <MapPin size={14} />
                <span>{auditStation}</span>
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
              photos={questionPhotos[question.id] || []}
              onAddPhoto={() => handlePhotoCapture(question.id)}
              onRemovePhoto={(index) => handleRemovePhoto(question.id, index)}
              onCreateAction={handleCreateActionForQuestion}
              showActionButton={true}
            />
          ))}
        </div>

        {/* Actions created during this audit */}
        {auditActions.length > 0 && (
          <Card className="p-4 bg-amazon-orange/5 border-amazon-orange/20">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList size={18} className="text-amazon-orange" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                Actions Created ({auditActions.length})
              </span>
            </div>
            <div className="space-y-2">
              {auditActions.map((action) => (
                <div
                  key={action.id}
                  className="flex items-center justify-between p-2 bg-white dark:bg-slate-800 rounded-lg"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate flex-1">
                    {action.questionText}
                  </span>
                  <div className="flex items-center gap-2">
                    {action.owner && (
                      <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                        {action.owner}
                      </span>
                    )}
                    <Badge
                      variant={action.priority === 'high' ? 'danger' : action.priority === 'medium' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {action.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

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

        {/* Global Notes with Voice Input */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Additional Notes
            </h3>
          </div>

          {/* Voice Input Button - More prominent */}
          {isSpeechRecognitionSupported() && !isRecordingNotes && !isProcessingVoice && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startNotesRecording}
              className="w-full mb-4 flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/30 transition-all"
            >
              <Mic size={20} />
              <span>Tap to Record Voice Note</span>
            </motion.button>
          )}

          {/* Voice Recording UI */}
          <AnimatePresence>
            {(isRecordingNotes || isProcessingVoice) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-4 rounded-xl border-2 ${
                  isRecordingNotes
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                    : 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isRecordingNotes ? (
                      <>
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-red-700 dark:text-red-300">Recording...</span>
                      </>
                    ) : (
                      <>
                        <Loader2 size={16} className="animate-spin text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
                          <Sparkles size={14} />
                          Processing with Gemini AI...
                        </span>
                      </>
                    )}
                  </div>
                  {isRecordingNotes && (
                    <button
                      onClick={cancelNotesRecording}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                {notesTranscript && (
                  <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg mb-3">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Transcript:</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{notesTranscript}</p>
                  </div>
                )}

                {isRecordingNotes && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={stopNotesRecording}
                    className="w-full py-3 px-4 rounded-xl bg-red-500 text-white font-medium flex items-center justify-center gap-2"
                  >
                    <Square size={16} fill="white" />
                    <span>Stop & Process</span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <textarea
            value={globalNotes}
            onChange={(e) => setGlobalNotes(e.target.value)}
            placeholder="Add any additional observations or notes... You can also use the Voice Note button above to speak your notes."
            rows={4}
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
              setQuestionPhotos({});
              setAuditActions([]);
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
