import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { aiApi } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

// Simple markdown renderer for policy responses
const renderMarkdown = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let currentListItems = [];
  let listKey = 0;

  const flushList = () => {
    if (currentListItems.length > 0) {
      elements.push(
        <ul key={`list-${listKey++}`} className="my-2 ml-4 space-y-1.5">
          {currentListItems}
        </ul>
      );
      currentListItems = [];
    }
  };

  const parseInlineFormatting = (text) => {
    // Parse bold (**text**) and return React elements
    const parts = [];
    let remaining = text;
    let partKey = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch) {
        const beforeBold = remaining.substring(0, boldMatch.index);
        if (beforeBold) {
          parts.push(<span key={partKey++}>{beforeBold}</span>);
        }
        parts.push(
          <strong key={partKey++} className="font-semibold text-slate-800 dark:text-white">
            {boldMatch[1]}
          </strong>
        );
        remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
      } else {
        parts.push(<span key={partKey++}>{remaining}</span>);
        break;
      }
    }

    return parts.length > 0 ? parts : text;
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Empty line - flush list and add spacing
    if (!trimmedLine) {
      flushList();
      return;
    }

    // Check for list items (-, *, •, o followed by space/tab)
    const listMatch = trimmedLine.match(/^[-*•o]\s+(.+)$/);
    if (listMatch) {
      currentListItems.push(
        <li key={`item-${index}`} className="flex items-start gap-2 text-slate-700 dark:text-slate-200">
          <span className="text-teal-500 mt-0.5 flex-shrink-0">•</span>
          <span>{parseInlineFormatting(listMatch[1])}</span>
        </li>
      );
      return;
    }

    // Indented list items (lines starting with multiple spaces/tabs followed by list marker)
    const indentedListMatch = trimmedLine.match(/^[-*•o]\s+(.+)$/);
    const hasLeadingWhitespace = line.match(/^\s{2,}/);
    if (hasLeadingWhitespace && indentedListMatch) {
      currentListItems.push(
        <li key={`item-${index}`} className="flex items-start gap-2 text-slate-700 dark:text-slate-200 ml-4">
          <span className="text-teal-400 mt-0.5 flex-shrink-0">◦</span>
          <span>{parseInlineFormatting(indentedListMatch[1])}</span>
        </li>
      );
      return;
    }

    // Flush any pending list before adding paragraph
    flushList();

    // Regular paragraph or heading-like text
    const isHeading = trimmedLine.match(/^\*\*[^*]+\*\*:?$/);
    if (isHeading) {
      elements.push(
        <p key={index} className="mt-3 mb-1 font-semibold text-slate-800 dark:text-white">
          {parseInlineFormatting(trimmedLine)}
        </p>
      );
    } else {
      elements.push(
        <p key={index} className="text-slate-700 dark:text-slate-200 leading-relaxed">
          {parseInlineFormatting(trimmedLine)}
        </p>
      );
    }
  });

  // Flush any remaining list items
  flushList();

  return <div className="space-y-1">{elements}</div>;
};

// Regulation links mapping
const REGULATION_LINKS = {
  'ASchG': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910',
  'ASchG - ArbeitnehmerInnenschutzgesetz': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910',
  'ArbeitnehmerInnenschutzgesetz': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910',
  'TRVB': 'https://www.trvb.at/',
  'TRVB - Technische Richtlinien Vorbeugender Brandschutz': 'https://www.trvb.at/',
  'Fire safety': 'https://www.trvb.at/',
  'Brandschutz': 'https://www.trvb.at/',
  'Emergency escape routes': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=24',
  'Fluchtwegeplanung': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=24',
  'PPE': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=69',
  'PSA': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=69',
  'ÖNORM Z 1020': 'https://www.austrian-standards.at/',
  'EN ISO 20345': 'https://www.iso.org/standard/51036.html',
  'Housekeeping': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=15',
  '5S Principles': 'https://www.lean.org/lexicon-terms/5s/',
  '5S': 'https://www.lean.org/lexicon-terms/5s/',
  'OSHA': 'https://www.osha.gov/',
  'Walkway requirements': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=23',
  'Verkehrswege': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=23',
  'Ergonomics': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=60',
  'Manual handling': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=60',
  'Electrical safety': 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008910&Paragraf=44',
};

// Function to get link for a source
const getSourceLink = (source) => {
  // Check for exact match first
  if (REGULATION_LINKS[source]) {
    return REGULATION_LINKS[source];
  }
  // Check for partial match
  for (const [key, url] of Object.entries(REGULATION_LINKS)) {
    if (source.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(source.toLowerCase())) {
      return url;
    }
  }
  return null;
};

export default function PolicyChatbot({ isOpen, onClose, initialMessage = '' }) {
  const { t, language, currentLanguage } = useLanguage();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('policyGreeting'),
      sources: [],
      relatedTopics: [
        t('walkwayRequirements'),
        t('fireExtinguisherPlacement'),
        t('ppeRequirements'),
      ],
    },
  ]);
  const [hasProcessedInitialMessage, setHasProcessedInitialMessage] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update greeting when language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{
          ...prev[0],
          content: t('policyGreeting'),
          relatedTopics: [
            t('walkwayRequirements'),
            t('fireExtinguisherPlacement'),
            t('ppeRequirements'),
          ],
        }];
      }
      return prev;
    });
  }, [language, t]);

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

          const response = await aiApi.policyChat(
            initialMessage,
            conversationHistory,
            language,
            currentLanguage?.name || 'English'
          );

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
  }, [isOpen, initialMessage, hasProcessedInitialMessage, messages, language, currentLanguage]);

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

      const response = await aiApi.policyChat(
        userMessage,
        conversationHistory,
        language,
        currentLanguage?.name || 'English'
      );

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
      toast.error(t('failedToGetResponse'));
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

  const getConfidenceLabel = (confidence) => {
    switch (confidence) {
      case 'high':
        return t('highConfidence');
      case 'medium':
        return t('mediumConfidence');
      case 'low':
        return t('lowConfidence');
      default:
        return confidence;
    }
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
                          {getConfidenceLabel(message.confidence)}
                        </span>
                      )}
                    </div>
                  )}

                  <div className={message.role === 'user' ? '' : 'px-4 pb-3'}>
                    {message.role === 'user' ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </p>
                    ) : (
                      <div className="text-sm">
                        {renderMarkdown(message.content)}
                      </div>
                    )}

                    {/* Sources with links */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                          <BookOpen size={12} />
                          {t('sources')}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {message.sources.map((source, i) => {
                            const link = getSourceLink(source);
                            return link ? (
                              <a
                                key={i}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors cursor-pointer"
                              >
                                <Tag size={10} />
                                {source}
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded-md text-slate-600 dark:text-slate-300"
                              >
                                <Tag size={10} />
                                {source}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Related Topics */}
                    {message.relatedTopics && message.relatedTopics.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
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
                      <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                        <div className="flex items-start gap-2">
                          <AlertCircle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            {message.disclaimer}
                          </p>
                        </div>
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
                  t('walkwayWidthQuestion'),
                  t('fireExtinguisherQuestion'),
                  t('maxLiftingQuestion'),
                  t('emergencyExitQuestion'),
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
