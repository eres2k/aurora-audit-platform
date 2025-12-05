import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Camera, AlertTriangle, Star, ChevronDown, MinusCircle, Plus, Trash2, Image, ClipboardList, Users, Sparkles, Loader2, Shield, XCircle, Mic, MicOff, Square, HelpCircle, Wand2, Zap, Languages } from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import PolicyChatbot from './PolicyChatbot';

// Check if Web Speech API is available
const isSpeechRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

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

  // Safety Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [safetyAnalysis, setSafetyAnalysis] = useState(null);

  // Help chatbot state
  const [showHelpChatbot, setShowHelpChatbot] = useState(false);
  const [helpInitialMessage, setHelpInitialMessage] = useState('');

  // Voice Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState(null);
  const recognitionRef = useRef(null);

  // Enhance Note state
  const [isEnhancingNote, setIsEnhancingNote] = useState(false);

  // Auto-suggest Action state
  const [isAutoSuggesting, setIsAutoSuggesting] = useState(false);

  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationResult, setTranslationResult] = useState(null);
  const { language, currentLanguage, t } = useLanguage();

  // Initialize speech recognition
  useEffect(() => {
    if (isSpeechRecognitionSupported()) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(prev => prev + finalTranscript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access.');
        } else if (event.error !== 'aborted') {
          toast.error('Voice recognition error. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Start voice recording
  const startRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      toast.error('Voice input is not supported in this browser. Try Chrome.');
      return;
    }

    setTranscript('');
    setVoiceResult(null);
    setIsRecording(true);

    try {
      recognitionRef.current.start();
      toast('Listening... Speak now', { icon: '🎤', duration: 2000 });
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setIsRecording(false);
      toast.error('Failed to start voice input');
    }
  };

  // Stop voice recording and process
  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);

    if (!transcript.trim()) {
      toast.error('No speech detected. Please try again.');
      return;
    }

    setIsProcessingVoice(true);

    try {
      const response = await aiApi.processVoiceNote(transcript, question.text);

      if (response.success && response.data) {
        const result = response.data;
        setVoiceResult(result);

        // Auto-fill note with cleaned text
        if (onNoteChange && result.cleanedNote) {
          onNoteChange(result.cleanedNote);
        }

        // Auto-suggest status if available
        if (result.suggestedStatus && onChange) {
          onChange(result.suggestedStatus);
          toast(`Status auto-set to ${result.suggestedStatus.toUpperCase()}`, {
            icon: result.suggestedStatus === 'pass' ? '✅' : result.suggestedStatus === 'fail' ? '❌' : '➖',
            duration: 3000,
          });
        }

        toast.success('Voice note processed!');
      } else {
        throw new Error(response.error || 'Failed to process voice note');
      }
    } catch (error) {
      console.error('Voice processing error:', error);
      // Still save the raw transcript even if processing fails
      if (onNoteChange && transcript) {
        onNoteChange(transcript);
        toast('Saved raw transcript (processing failed)', { icon: '⚠️' });
      } else {
        toast.error(error.message || 'Failed to process voice note');
      }
    } finally {
      setIsProcessingVoice(false);
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setIsRecording(false);
    setTranscript('');
  };

  // Open help chatbot with question context
  const openHelpChatbot = () => {
    const message = `What are the Austrian ASchG (ArbeitnehmerInnenschutzgesetz) requirements and best practices for: "${question.text}"? Please provide relevant regulations, standards, and practical guidance.`;
    setHelpInitialMessage(message);
    setShowHelpChatbot(true);
  };

  // Translate question to local language with steps
  const handleTranslateQuestion = async () => {
    if (language === 'en') {
      toast('Question is already in English', { icon: 'ℹ️' });
      return;
    }

    // If already translated, just toggle the display
    if (translationResult) {
      setTranslationResult(null);
      return;
    }

    setIsTranslating(true);

    try {
      const response = await aiApi.translateQuestion(
        question.text,
        language,
        currentLanguage.name
      );

      if (response.success && response.data) {
        setTranslationResult(response.data);
        toast.success(t('translatedQuestion'));
      } else {
        throw new Error(response.error || 'Failed to translate question');
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(error.message || 'Failed to translate question');
    } finally {
      setIsTranslating(false);
    }
  };

  // Create action from recommendation
  const createActionFromRecommendation = (recommendation) => {
    if (onCreateAction) {
      onCreateAction({
        questionId: question.id,
        questionText: question.text,
        priority: safetyAnalysis?.severity === 'high' ? 'high' : safetyAnalysis?.severity === 'medium' ? 'medium' : 'low',
        notes: recommendation,
        owner: null,
        critical: question.critical || safetyAnalysis?.severity === 'high',
      });
      toast.success('Action created from recommendation');
    }
  };

  // Handle safety image analysis
  const handleAnalyze = async () => {
    if (!photos || photos.length === 0) {
      toast.error('No photo available to analyze');
      return;
    }

    setIsAnalyzing(true);
    setSafetyAnalysis(null);

    try {
      // Use the first/most recent photo for analysis
      const imageToAnalyze = photos[photos.length - 1];
      const response = await aiApi.analyzeImage(imageToAnalyze, question.text);

      if (response.success && response.data) {
        const analysis = response.data;
        setSafetyAnalysis(analysis);

        // If hazard detected with high severity, auto-suggest fail and update notes
        if (analysis.hazardDetected) {
          if (analysis.severity === 'high' && value !== 'fail') {
            // Suggest changing to fail for high severity hazards
            onChange('fail');
            toast('High-severity hazard detected. Status changed to Fail.', {
              icon: '⚠️',
              duration: 4000,
            });
          } else if (analysis.severity === 'medium') {
            toast('Medium-severity hazard detected. Review recommended.', {
              icon: '⚠️',
              duration: 4000,
            });
          }

          // Auto-fill notes with analysis description
          if (onNoteChange && analysis.description) {
            const aiNote = `[Safety Analysis] ${analysis.description}${analysis.recommendation ? `\n\nRecommendation: ${analysis.recommendation}` : ''}`;
            onNoteChange(aiNote);
          }
        } else {
          toast.success('Analysis complete - No hazards detected');
        }
      } else {
        throw new Error(response.error || 'Failed to analyze image');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze image');
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

  // Handle enhance note with AI
  const handleEnhanceNote = async () => {
    if (!note || note.trim().length < 5) {
      toast.error('Please write a note first (at least 5 characters)');
      return;
    }

    setIsEnhancingNote(true);

    try {
      const response = await aiApi.enhanceNote(note, question.text);

      if (response.success && response.data) {
        const rawResult = response.data;
        const result = Array.isArray(rawResult)
          ? rawResult.find(item => item?.enhancedNote || item?.enhanced_note) || rawResult[0]
          : rawResult;
        const enhancedNote = result?.enhancedNote || result?.enhanced_note;

        if (enhancedNote) {
          if (onNoteChange) {
            onNoteChange(enhancedNote);
            toast.success('Note enhanced!');
          } else {
            console.error('onNoteChange prop is not available');
            toast.error('Unable to update note');
          }
        } else {
          console.error('No enhanced note returned from AI:', result);
          toast.error('AI returned empty response. Please try again.');
        }
      } else {
        throw new Error(response.error || 'Failed to enhance note');
      }
    } catch (error) {
      console.error('Enhance note error:', error);
      toast.error(error.message || 'Failed to enhance note');
    } finally {
      setIsEnhancingNote(false);
    }
  };

  // Handle auto-suggest action
  const handleAutoSuggestAction = async () => {
    setIsAutoSuggesting(true);

    try {
      const response = await aiApi.autoSuggestAction(
        question.text,
        note || '',
        safetyAnalysis
      );

      if (response.success && response.data) {
        const result = response.data;

        // Update action data with suggestions
        setActionData(prev => ({
          ...prev,
          priority: result.priority || prev.priority,
          notes: result.description || prev.notes,
          owner: result.suggestedOwner || prev.owner,
        }));

        toast.success('Action auto-filled!');
      } else {
        throw new Error(response.error || 'Failed to suggest action');
      }
    } catch (error) {
      console.error('Auto-suggest action error:', error);
      toast.error(error.message || 'Failed to auto-suggest action');
    } finally {
      setIsAutoSuggesting(false);
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
      <div className="w-full px-5 py-4 flex items-start gap-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 text-left"
        >
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
        </button>
        {/* Translate button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            handleTranslateQuestion();
          }}
          disabled={isTranslating}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
            translationResult
              ? 'bg-blue-500 text-white'
              : isTranslating
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-400'
              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50'
          }`}
          title={t('translateQuestion')}
        >
          {isTranslating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Languages size={16} />
          )}
        </motion.button>
        {/* Help button for ASchG info */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            openHelpChatbot();
          }}
          className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 flex items-center justify-center hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors flex-shrink-0"
          title={t('getRegulationsInfo')}
        >
          <HelpCircle size={16} />
        </motion.button>
        <button onClick={() => setIsExpanded(!isExpanded)}>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-slate-400"
          >
            <ChevronDown size={20} />
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5"
          >
            {/* Translation Result Display */}
            <AnimatePresence>
              {translationResult && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                        <Languages size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          {t('translatedQuestion')} ({currentLanguage?.flag} {currentLanguage?.name})
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setTranslationResult(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  {/* Translated Question */}
                  <div className="mb-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                      {translationResult.translatedQuestion}
                    </p>
                  </div>

                  {/* Steps to Check */}
                  {translationResult.stepsToCheck && translationResult.stepsToCheck.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                        {t('stepsToCheck')}
                      </p>
                      <ol className="space-y-2">
                        {translationResult.stepsToCheck.map((step, i) => (
                          <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Keywords */}
                  {translationResult.keywords && translationResult.keywords.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {translationResult.keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {translationResult.tips && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        💡 {translationResult.tips}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {renderInput()}

            {/* Note field for failed items */}
            {value === 'fail' && (
              <div className="mt-4 animate-in fade-in">
                <label className="text-xs font-bold text-red-600 uppercase mb-2 block">
                  Describe the issue
                </label>
                <div className="relative">
                  <textarea
                    value={note || ''}
                    onChange={(e) => onNoteChange && onNoteChange(e.target.value)}
                    placeholder="Describe the problem..."
                    rows={2}
                    className="w-full text-sm p-3 pr-24 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-800 dark:text-red-200 placeholder:text-red-300 dark:placeholder:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-300"
                  />
                  {/* Button group for voice input and enhance note */}
                  <div className="absolute right-2 top-2 flex gap-1 z-10">
                    {/* Microphone button for voice input */}
                    {isSpeechRecognitionSupported() && !isRecording && !isProcessingVoice && (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={startRecording}
                        className="w-8 h-8 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center shadow-sm transition-colors"
                        title="Voice input"
                      >
                        <Mic size={16} />
                      </motion.button>
                    )}
                    {/* Enhance Note button */}
                    {note && note.trim().length >= 5 && !isEnhancingNote && (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={handleEnhanceNote}
                        className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center justify-center shadow-sm transition-colors"
                        title="Enhance Note with AI"
                      >
                        <Wand2 size={16} />
                      </motion.button>
                    )}
                    {/* Loading state for enhance */}
                    {isEnhancingNote && (
                      <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                        <Loader2 size={16} className="animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Enhance Note hint */}
                {note && note.trim().length >= 5 && !isEnhancingNote && (
                  <p className="mt-1 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <Wand2 size={10} />
                    Click the wand icon to enhance your note with AI
                  </p>
                )}
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

            {/* Safety Analysis Results */}
            <AnimatePresence>
              {safetyAnalysis && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-4 p-4 rounded-xl border-2 ${
                    safetyAnalysis.hazardDetected
                      ? safetyAnalysis.severity === 'high'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                        : safetyAnalysis.severity === 'medium'
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700'
                        : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                      : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {safetyAnalysis.hazardDetected ? (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          safetyAnalysis.severity === 'high' ? 'bg-red-500' :
                          safetyAnalysis.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
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
                          Safety Analysis
                        </p>
                        <p className={`text-sm font-semibold ${
                          safetyAnalysis.hazardDetected
                            ? safetyAnalysis.severity === 'high' ? 'text-red-700 dark:text-red-300' :
                              safetyAnalysis.severity === 'medium' ? 'text-amber-700 dark:text-amber-300' :
                              'text-blue-700 dark:text-blue-300'
                            : 'text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {safetyAnalysis.hazardDetected
                            ? `Hazard Detected - ${safetyAnalysis.severity?.toUpperCase()} Severity`
                            : 'No Hazards Detected'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSafetyAnalysis(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  {safetyAnalysis.description && (
                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
                      {safetyAnalysis.description}
                    </p>
                  )}

                  {safetyAnalysis.recommendation && (
                    <div className="mt-3 p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                          Recommendation
                        </p>
                        {onCreateAction && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => createActionFromRecommendation(safetyAnalysis.recommendation)}
                            className="text-xs px-2 py-1 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors flex items-center gap-1"
                          >
                            <Plus size={12} />
                            Use as Action
                          </motion.button>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {safetyAnalysis.recommendation}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className={`px-2 py-0.5 rounded-full ${
                      safetyAnalysis.complianceStatus === 'compliant'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : safetyAnalysis.complianceStatus === 'non-compliant'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                    }`}>
                      {safetyAnalysis.complianceStatus?.replace('-', ' ')}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <span>Confidence: {safetyAnalysis.confidence}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voice Recording Overlay */}
            <AnimatePresence>
              {(isRecording || isProcessingVoice) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className={`mt-4 p-4 rounded-xl border-2 ${
                    isRecording
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                      : 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isRecording ? (
                        <>
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-red-700 dark:text-red-300">Recording...</span>
                        </>
                      ) : (
                        <>
                          <Loader2 size={16} className="animate-spin text-purple-600 dark:text-purple-400" />
                          <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Processing...</span>
                        </>
                      )}
                    </div>
                    {isRecording && (
                      <button
                        onClick={cancelRecording}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  {transcript && (
                    <div className="p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg mb-3">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Transcript:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{transcript}</p>
                    </div>
                  )}

                  {isRecording && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={stopRecording}
                      className="w-full py-3 px-4 rounded-xl bg-red-500 text-white font-medium flex items-center justify-center gap-2"
                    >
                      <Square size={16} fill="white" />
                      <span>Stop & Process</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Voice AI Result Display - Enhanced Smart Assistant */}
            <AnimatePresence>
              {voiceResult && !isRecording && !isProcessingVoice && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-2 border-indigo-300 dark:border-indigo-700"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          Smart Voice Assistant
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          AI analyzed your voice note
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setVoiceResult(null)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  {/* Suggested Status and Severity - Clickable Apply Buttons */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {/* Suggested Status */}
                    {voiceResult.suggestedStatus && (
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (onChange) {
                            onChange(voiceResult.suggestedStatus);
                            toast.success(`Status set to ${voiceResult.suggestedStatus.toUpperCase()}`);
                          }
                        }}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          value === voiceResult.suggestedStatus
                            ? 'border-green-400 bg-green-100 dark:bg-green-900/30'
                            : 'border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Status</span>
                          {value !== voiceResult.suggestedStatus && (
                            <span className="text-xs text-indigo-500 font-medium">Tap to apply</span>
                          )}
                          {value === voiceResult.suggestedStatus && (
                            <Check size={14} className="text-green-500" />
                          )}
                        </div>
                        <div className={`text-lg font-bold ${
                          voiceResult.suggestedStatus === 'fail' ? 'text-red-600 dark:text-red-400' :
                          voiceResult.suggestedStatus === 'pass' ? 'text-emerald-600 dark:text-emerald-400' :
                          'text-slate-600 dark:text-slate-400'
                        }`}>
                          {voiceResult.suggestedStatus === 'fail' ? 'RISK' :
                           voiceResult.suggestedStatus === 'pass' ? 'SAFE' :
                           voiceResult.suggestedStatus?.toUpperCase()}
                        </div>
                      </motion.button>
                    )}

                    {/* Suggested Severity */}
                    {voiceResult.suggestedSeverity && (
                      <div className={`p-3 rounded-xl border-2 ${
                        voiceResult.suggestedSeverity === 'high'
                          ? 'border-red-300 bg-red-100 dark:border-red-700 dark:bg-red-900/30'
                          : voiceResult.suggestedSeverity === 'medium'
                          ? 'border-amber-300 bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30'
                          : 'border-blue-300 bg-blue-100 dark:border-blue-700 dark:bg-blue-900/30'
                      }`}>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">Severity</span>
                        <div className={`text-lg font-bold ${
                          voiceResult.suggestedSeverity === 'high' ? 'text-red-600 dark:text-red-400' :
                          voiceResult.suggestedSeverity === 'medium' ? 'text-amber-600 dark:text-amber-400' :
                          'text-blue-600 dark:text-blue-400'
                        }`}>
                          {voiceResult.suggestedSeverity?.toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Extracted Details */}
                  {voiceResult.extractedDetails && Object.values(voiceResult.extractedDetails).some(v => v) && (
                    <div className="mb-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Extracted Details</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {voiceResult.extractedDetails.location && (
                          <div>
                            <span className="text-xs text-slate-400">Location:</span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{voiceResult.extractedDetails.location}</p>
                          </div>
                        )}
                        {voiceResult.extractedDetails.equipment && (
                          <div>
                            <span className="text-xs text-slate-400">Equipment:</span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{voiceResult.extractedDetails.equipment}</p>
                          </div>
                        )}
                        {voiceResult.extractedDetails.dateOrExpiry && (
                          <div>
                            <span className="text-xs text-slate-400">Date/Expiry:</span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{voiceResult.extractedDetails.dateOrExpiry}</p>
                          </div>
                        )}
                        {voiceResult.extractedDetails.quantity && (
                          <div>
                            <span className="text-xs text-slate-400">Quantity:</span>
                            <p className="text-slate-700 dark:text-slate-300 font-medium">{voiceResult.extractedDetails.quantity}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Key Observations */}
                  {voiceResult.keyObservations && voiceResult.keyObservations.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Key Observations:</p>
                      <ul className="space-y-1">
                        {voiceResult.keyObservations.map((obs, i) => (
                          <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2">
                            <span className="text-indigo-500">•</span>
                            <span>{obs}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommended Action */}
                  {voiceResult.recommendedAction && (
                    <div className="p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                          Recommended Action
                        </p>
                        {onCreateAction && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => createActionFromRecommendation(voiceResult.recommendedAction)}
                            className="text-xs px-2 py-1 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors flex items-center gap-1"
                          >
                            <Plus size={12} />
                            Use as Action
                          </motion.button>
                        )}
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {voiceResult.recommendedAction}
                      </p>
                    </div>
                  )}
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

              {/* Analyze button - only visible if photo exists */}
              {photos && photos.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                    isAnalyzing
                      ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 cursor-wait'
                      : safetyAnalysis
                      ? safetyAnalysis.hazardDetected
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
                      <span>Analyze</span>
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
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-amazon-orange uppercase">
                      New Action
                    </div>
                    {/* Auto-Suggest Button */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAutoSuggestAction}
                      disabled={isAutoSuggesting}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                        isAutoSuggesting
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-500 cursor-wait'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-sm'
                      }`}
                    >
                      {isAutoSuggesting ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Suggesting...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={12} />
                          <span>Auto-Suggest</span>
                        </>
                      )}
                    </motion.button>
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

      {/* Help Chatbot Modal */}
      <PolicyChatbot
        isOpen={showHelpChatbot}
        onClose={() => setShowHelpChatbot(false)}
        initialMessage={helpInitialMessage}
      />
    </motion.div>
  );
}
