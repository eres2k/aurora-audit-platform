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
  ExternalLink,
  FileText,
  Scale,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../../utils/api';

// Policy reference links with section anchors
const POLICY_LINKS = {
  'ASchG': {
    name: 'ArbeitnehmerInnenschutzgesetz',
    url: 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910',
    icon: Scale,
  },
  'ASchG §4': {
    name: 'ASchG - Allgemeine Pflichten',
    url: 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=4',
    icon: FileText,
  },
  'ASchG §6': {
    name: 'ASchG - Ermittlung und Beurteilung',
    url: 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=6',
    icon: FileText,
  },
  'ASchG §14': {
    name: 'ASchG - Unterweisung',
    url: 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=14',
    icon: FileText,
  },
  'ASchG §25': {
    name: 'ASchG - Erste Hilfe',
    url: 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=25',
    icon: FileText,
  },
  'OSHA': {
    name: 'OSHA Regulations',
    url: 'https://www.osha.gov/laws-regs/regulations/standardnumber',
    icon: Scale,
  },
  'OSHA 1910': {
    name: 'OSHA General Industry',
    url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910',
    icon: FileText,
  },
  'OSHA 1910.37': {
    name: 'OSHA - Means of Egress',
    url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.37',
    icon: FileText,
  },
  'OSHA 1910.157': {
    name: 'OSHA - Fire Extinguishers',
    url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.157',
    icon: FileText,
  },
  'ArbStättV': {
    name: 'Arbeitsstättenverordnung',
    url: 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=20001410',
    icon: Scale,
  },
};

// Function to parse source text and extract linkable references
const parseSourcesForLinks = (source) => {
  // Check if source matches any known policy references
  for (const [key, info] of Object.entries(POLICY_LINKS)) {
    if (source.toLowerCase().includes(key.toLowerCase())) {
      return { ...info, key, matched: true };
    }
  }
  return null;
};

// Format message content with better structure
const formatMessageContent = (content) => {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n');

  return paragraphs.map((para, index) => {
    // Check for bullet points
    if (para.includes('\n*') || para.includes('\n-') || para.startsWith('*') || para.startsWith('-')) {
      const lines = para.split('\n');
      const listItems = lines.filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'));
      const nonListItems = lines.filter(line => !line.trim().startsWith('*') && !line.trim().startsWith('-'));

      return (
        <div key={index} className="mb-3">
          {nonListItems.length > 0 && (
            <p className="mb-2">{nonListItems.join(' ')}</p>
          )}
          {listItems.length > 0 && (
            <ul className="space-y-1.5 ml-1">
              {listItems.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-2 flex-shrink-0" />
                  <span>{item.replace(/^[*-]\s*/, '')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    // Check for numbered lists
    if (/^\d+\.\s/.test(para) || para.includes('\n1.')) {
      const lines = para.split('\n');
      return (
        <ol key={index} className="space-y-2 mb-3 ml-1">
          {lines.filter(line => /^\d+\.\s/.test(line.trim())).map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                {i + 1}
              </span>
              <span>{item.replace(/^\d+\.\s*/, '')}</span>
            </li>
          ))}
        </ol>
      );
    }

    // Check for headings (text ending with :)
    if (para.trim().endsWith(':') && para.length < 100) {
      return (
        <h4 key={index} className="font-semibold text-slate-800 dark:text-slate-100 mb-2 mt-3 first:mt-0">
          {para}
        </h4>
      );
    }

    // Regular paragraph
    return (
      <p key={index} className="mb-3 last:mb-0 leading-relaxed">
        {para}
      </p>
    );
  });
};

export default function PolicyChatbot({ isOpen, onClose, initialMessage = '' }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize messages with translated greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: t('policyAssistant.greeting'),
          sources: [],
          relatedTopics: [
            t('policyAssistant.defaultTopics.walkway'),
            t('policyAssistant.defaultTopics.fireExtinguisher'),
            t('policyAssistant.defaultTopics.ppe'),
          ],
        },
      ]);
    }
  }, [t, messages.length]);

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
              content: t('policyAssistant.errorMessage'),
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
          content: t('policyAssistant.errorMessage'),
          sources: [],
          relatedTopics: [],
        },
      ]);
      toast.error('Failed to get response');
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

  const quickQuestions = [
    t('policyAssistant.quickQuestions.walkwayWidth'),
    t('policyAssistant.quickQuestions.fireExtinguisher'),
    t('policyAssistant.quickQuestions.liftingWeight'),
    t('policyAssistant.quickQuestions.emergencyExit'),
  ];

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
          className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
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
                    {t('policyAssistant.title')}
                  </h2>
                  <p className="text-xs text-white/80">{t('policyAssistant.subtitle')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Quick links to full policies */}
                <a
                  href={t('policyAssistant.policyLinks.aschgUrl')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs hover:bg-white/30 transition-colors"
                >
                  <Scale size={14} />
                  {t('policyAssistant.policyLinks.aschg')}
                  <ExternalLink size={12} />
                </a>
                <a
                  href={t('policyAssistant.policyLinks.oshaUrl')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs hover:bg-white/30 transition-colors"
                >
                  <Scale size={14} />
                  {t('policyAssistant.policyLinks.osha')}
                  <ExternalLink size={12} />
                </a>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
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
                  className={`max-w-[90%] ${
                    message.role === 'user'
                      ? 'bg-amazon-orange text-white rounded-2xl rounded-tr-sm px-4 py-3'
                      : 'bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="px-4 pt-3 pb-1 flex items-center gap-2 flex-wrap">
                      <Sparkles size={14} className="text-teal-500" />
                      <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                        AuditHub
                      </span>
                      {message.confidence && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          message.confidence === 'high'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : message.confidence === 'medium'
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                        }`}>
                          {t(`policyAssistant.confidence.${message.confidence}`)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={message.role === 'user' ? '' : 'px-4 pb-3'}>
                    <div className={`text-sm ${
                      message.role === 'user' ? '' : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {message.role === 'assistant'
                        ? formatMessageContent(message.content)
                        : <p className="whitespace-pre-wrap">{message.content}</p>
                      }
                    </div>

                    {/* Sources with clickable links */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                          <BookOpen size={14} />
                          {t('policyAssistant.sources')}
                        </p>
                        <div className="space-y-1.5">
                          {message.sources.map((source, i) => {
                            const linkInfo = parseSourcesForLinks(source);
                            const IconComponent = linkInfo?.icon || FileText;

                            return linkInfo?.url ? (
                              <a
                                key={i}
                                href={linkInfo.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-xs px-3 py-2 bg-slate-200/70 dark:bg-slate-600/70 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-teal-100 dark:hover:bg-teal-900/40 hover:text-teal-700 dark:hover:text-teal-300 transition-colors group"
                              >
                                <IconComponent size={14} className="text-slate-500 dark:text-slate-400 group-hover:text-teal-500" />
                                <span className="flex-1">{source}</span>
                                <ExternalLink size={12} className="text-slate-400 group-hover:text-teal-500" />
                              </a>
                            ) : (
                              <div
                                key={i}
                                className="flex items-center gap-2 text-xs px-3 py-2 bg-slate-200/70 dark:bg-slate-600/70 rounded-lg text-slate-600 dark:text-slate-300"
                              >
                                <FileText size={14} className="text-slate-500 dark:text-slate-400" />
                                <span>{source}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Related Topics */}
                    {message.relatedTopics && message.relatedTopics.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                          {t('policyAssistant.relatedTopics')}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {message.relatedTopics.map((topic, i) => (
                            <button
                              key={i}
                              onClick={() => handleQuickQuestion(topic)}
                              className="text-xs px-3 py-1.5 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-lg hover:bg-teal-200 dark:hover:bg-teal-900/50 transition-colors flex items-center gap-1.5"
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
                      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start gap-2 border border-amber-200 dark:border-amber-800/30">
                        <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
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
                      {t('policyAssistant.searching')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3 border-t border-slate-100 dark:border-slate-700 pt-3">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                {t('policyAssistant.commonQuestions')}
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5"
                  >
                    <HelpCircle size={12} />
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('policyAssistant.placeholder')}
                  disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none text-sm transition-all"
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg shadow-teal-500/30'
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
