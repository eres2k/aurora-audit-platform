import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  Shield,
  BarChart3,
  Smartphone,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Button from './ui/Button';

const features = [
  { icon: Shield, title: 'Safety First', desc: 'Comprehensive safety audits' },
  { icon: BarChart3, title: 'Analytics', desc: 'Real-time insights & trends' },
  { icon: Smartphone, title: 'Mobile Ready', desc: 'Works anywhere, anytime' },
  { icon: Clock, title: 'Fast', desc: 'Complete audits in minutes' },
];

const highlights = [
  'Multi-station audit management',
  'Real-time compliance tracking',
  'Smart insights & recommendations',
  'Customizable audit templates',
  'Digital signatures & photos',
  'Offline support',
];

export default function LoginPage() {
  const { login, signup } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amazon-orange/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amazon-teal/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amazon-orange to-amazon-orange-dark flex items-center justify-center shadow-2xl shadow-amazon-orange/30">
            <Zap size={32} className="text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl text-white">
              AuditHub
            </h1>
            <p className="text-sm text-slate-400">Safety Audits</p>
          </div>
        </motion.div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center max-w-md mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
            Streamline Your
            <span className="text-gradient"> Safety Audits</span>
          </h2>
          <p className="text-slate-400">
            The most advanced audit platform for logistics operations.
            Mobile-first, offline-ready, and built for scale.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-10 max-w-lg"
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex flex-col items-center text-center w-20"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-2">
                <feature.icon size={24} className="text-amazon-orange" />
              </div>
              <h3 className="font-semibold text-white text-xs">{feature.title}</h3>
              <p className="text-xs text-slate-500">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Auth Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={login}
            className="w-full"
          >
            Sign In
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={signup}
            className="w-full border-amazon-orange text-amazon-orange hover:bg-amazon-orange hover:text-white"
          >
            Create Account
          </Button>
        </motion.div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 max-w-md"
        >
          <div className="grid grid-cols-2 gap-3">
            {highlights.map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-center gap-2 text-sm"
              >
                <CheckCircle size={16} className="text-amazon-green flex-shrink-0" />
                <span className="text-slate-400">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center"
        >
          <p className="text-xs text-slate-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Secure authentication powered by Netlify Identity
          </p>
        </motion.div>
      </div>
    </div>
  );
}
