import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import PolicyChatbot from '../audit/PolicyChatbot';

export default function GlobalChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button - positioned above mobile nav */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed right-4 w-14 h-14 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center z-50 bottom-20 lg:bottom-6"
            title="Ask AuditHub - Policy Assistant"
          >
            <MessageCircle size={24} />
            {/* Pulse indicator */}
            <span className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Policy Chatbot Modal */}
      <PolicyChatbot
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
