import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  BookOpen,
  AlertCircle,
  ChevronRight,
  HelpCircle,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

export default function PolicyChatbot({ isOpen, onClose, initialMessage = '' }) {
  const { t } = useLanguage();

  const [messages, setMessages] = useState([]);
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize messages with translated greeting when component mounts or language changes
  useEffect(() => {
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'assistant')) {
      setMessages([
        {
          role: 'assistant',
          content: t('policyGreeting'),
          sources: [],
          relatedTopics: [
            t('walkwayClearanceRequirements'),
            t('fireExtinguisherPlacement'),
            t('ppeRequirements'),
          ],
        },
      ]);
    }
  }, [t]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Process initial message when provided
  useEffect(() => {
    if (isOpen && initialMessage && !hasProcessedInitialMessage) {
      setHasProcessedInitialMessage(true);
      // Automatically send the initial message
      const sendInitialMessage = async () => {
        setMessages(prev => [...prev, { role: 'user', content: initialMessage }]);
        setIsLoading(true);

        try {
          const conversationHistory = messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content,
          }));

          const response = await aiApi.policyChat(initialMessage, conversationHistory);

          if (response.success && response.data) {
            const { answer, sources, relatedTopics, confidence, disclaimer } = response.data;

            setMessages(prev => [
              ...prev,
              {
                role: 'assistant',
                content: answer,
                sources: sources || [],
                relatedTopics: relatedTopics || [],
                confidence,
                disclaimer,
              },
            ]);
          } else {
            throw new Error(response.error || 'Failed to get response');
          }
        } catch (error) {
          console.error('Policy chat error:', error);
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              content: t('policyErrorMessage'),
              sources: [],
              relatedTopics: [],
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      };

      sendInitialMessage();
    }
  }, [isOpen, initialMessage, hasProcessedInitialMessage, messages, t]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasProcessedInitialMessage(false);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await aiApi.policyChat(userMessage, conversationHistory);

      if (response.success && response.data) {
        const { answer, sources, relatedTopics, confidence, disclaimer } = response.data;

        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: answer,
            sources: sources || [],
            relatedTopics: relatedTopics || [],
            confidence,
            disclaimer,
          },
        ]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Policy chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: t('policyErrorMessage'),
          sources: [],
          relatedTopics: [],
        },
      ]);
      toast.error(t('policyErrorToast'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-500 to-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-white flex items-center gap-2">
                    {t('policyAssistant')}
                  </h2>
                  <p className="text-xs text-white/80">{t('policySubtitle')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-amazon-orange text-white rounded-2xl rounded-tr-sm px-4 py-3'
                      : 'bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                      <Sparkles size={14} className="text-teal-500" />
                      <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                        AuditHub
                      </span>
                      {message.confidence && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          message.confidence === 'high'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : message.confidence === 'medium'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                        }`}>
                          {t(`confidence${message.confidence.charAt(0).toUpperCase() + message.confidence.slice(1)}`)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={message.role === 'user' ? '' : 'px-4 pb-3'}>
                    <p className={`text-sm whitespace-pre-wrap ${
                      message.role === 'user' ? '' : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {message.content}
                    </p>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                          <BookOpen size={12} />
                          {t('sources')}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {message.sources.map((source, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                            >
                              {source}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Related Topics */}
                    {message.relatedTopics && message.relatedTopics.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                          {t('relatedTopics')}:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.relatedTopics.map((topic, i) => (
                            <button
                              key={i}
                              onClick={() => handleQuickQuestion(topic)}
                              className="text-xs px-2.5 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors flex items-center gap-1"
                            >
                              <ChevronRight size={12} />
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Disclaimer */}
                    {message.disclaimer && (
                      <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start gap-2">
                        <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          {message.disclaimer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-teal-500" />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {t('searchingRegulations')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                {t('commonQuestions')}:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  t('questionWalkwayWidth'),
                  t('questionFireExtinguisher'),
                  t('questionLiftingWeight'),
                  t('questionEmergencyExit'),
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                  >
                    <HelpCircle size={12} />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('askAboutRegulations')}
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-teal-500/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-teal-500 text-white hover:bg-teal-600'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                }`}
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
