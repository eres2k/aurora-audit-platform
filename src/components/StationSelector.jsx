import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Building2, CheckCircle2, Zap } from 'lucide-react';
import Button from './ui/Button';

export default function StationSelector() {
  const navigate = useNavigate();
  const { user, stations, selectedStation, selectStation } = useAuth();

  const handleStationSelect = (stationId) => {
    selectStation(stationId);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amazon-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amazon-teal/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amazon-orange to-amazon-orange-dark rounded-2xl mb-4 shadow-lg shadow-amazon-orange/30">
            <Building2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            Select Your Station
          </h1>
          <p className="text-slate-400">
            Welcome, {user?.user_metadata?.full_name || user?.email}
          </p>
          <p className="text-slate-500 text-sm mt-1">
            Choose a station to begin your audit session
          </p>
        </motion.div>

        {/* Station Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {stations.map((station, index) => {
            const isSelected = selectedStation === station.id;

            return (
              <motion.button
                key={station.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => handleStationSelect(station.id)}
                className={`
                  relative bg-slate-800/50 backdrop-blur rounded-2xl p-6 text-left
                  border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-amazon-orange shadow-lg shadow-amazon-orange/20'
                    : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/70'
                  }
                `}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-3 right-3"
                  >
                    <CheckCircle2 size={24} className="text-amazon-orange" />
                  </motion.div>
                )}

                {/* Station Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 ${station.color} rounded-xl mb-4`}>
                  <MapPin size={24} className="text-white" />
                </div>

                {/* Station Info */}
                <h3 className="text-xl font-bold text-white mb-1">{station.name}</h3>
                <p className="text-slate-400 text-sm">{station.fullName}</p>

                {/* Status Badge */}
                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />
                  Active
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Continue Section */}
        {selectedStation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 text-center border border-slate-700"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin size={20} className="text-amazon-orange" />
              <span className="text-white font-medium">
                Station selected: <span className="text-amazon-orange">{selectedStation}</span>
              </span>
            </div>
            <Button
              variant="primary"
              size="lg"
              icon={Zap}
              onClick={() => navigate('/dashboard')}
              className="px-8"
            >
              Continue to Dashboard
            </Button>
          </motion.div>
        )}

        {/* Info Card */}
        {!selectedStation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-amazon-teal/10 border border-amazon-teal/30 rounded-xl p-4 text-center"
          >
            <p className="text-amazon-teal text-sm">
              Select a station to access audit templates and begin your safety inspections
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
