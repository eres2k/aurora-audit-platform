import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Moon,
  Sun,
  Globe,
  Shield,
  Database,
  Trash2,
  Download,
  LogOut,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAudits } from '../context/AuditContext';
import { Card, Button, Modal } from '../components/ui';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, selectedStation, stations, selectStation, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { audits, templates } = useAudits();
  const [showStationModal, setShowStationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleExportData = () => {
    const data = {
      audits,
      templates,
      exportDate: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `auditflow_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success('Data exported successfully');
  };

  const handleClearData = () => {
    localStorage.clear();
    toast.success('All data cleared');
    setShowDeleteModal(false);
    window.location.reload();
  };

  const SettingItem = ({ icon: Icon, title, description, action, danger = false }) => (
    <div className={`flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${danger ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl ${danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
          <Icon size={20} className={danger ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'} />
        </div>
        <div>
          <h3 className={`font-medium ${danger ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>
            {title}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your account and app preferences
        </p>
      </div>

      {/* Profile Section */}
      <Card className="overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-amazon-orange/10 to-amazon-teal/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amazon-orange to-amazon-teal flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {user?.user_metadata?.full_name || 'User'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <SettingItem
            icon={MapPin}
            title="Current Station"
            description={selectedStation || 'No station selected'}
            action={
              <Button variant="ghost" size="sm" onClick={() => setShowStationModal(true)}>
                Change <ChevronRight size={16} />
              </Button>
            }
          />
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white px-4 pt-4 pb-2">
          Appearance
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <SettingItem
            icon={isDark ? Moon : Sun}
            title="Dark Mode"
            description={isDark ? 'Dark theme is enabled' : 'Light theme is enabled'}
            action={
              <button
                onClick={toggleTheme}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${isDark ? 'bg-amazon-orange' : 'bg-slate-200'}`}
              >
                <motion.div
                  animate={{ x: isDark ? 24 : 0 }}
                  className="w-6 h-6 rounded-full bg-white shadow-md"
                />
              </button>
            }
          />
          <SettingItem
            icon={Globe}
            title="Language"
            description="English (US)"
            action={
              <Button variant="ghost" size="sm">
                Change <ChevronRight size={16} />
              </Button>
            }
          />
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white px-4 pt-4 pb-2">
          Notifications
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <SettingItem
            icon={Bell}
            title="Push Notifications"
            description="Receive alerts for new actions"
            action={
              <button className="w-14 h-8 rounded-full p-1 transition-colors bg-amazon-orange">
                <motion.div
                  animate={{ x: 24 }}
                  className="w-6 h-6 rounded-full bg-white shadow-md"
                />
              </button>
            }
          />
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white px-4 pt-4 pb-2">
          Data Management
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <SettingItem
            icon={Download}
            title="Export Data"
            description="Download all your audits and templates"
            action={
              <Button variant="secondary" size="sm" onClick={handleExportData}>
                Export
              </Button>
            }
          />
          <SettingItem
            icon={Database}
            title="Storage Used"
            description={`${audits.length} audits, ${templates.length} templates`}
            action={null}
          />
          <SettingItem
            icon={Trash2}
            title="Clear All Data"
            description="Permanently delete all local data"
            danger
            action={
              <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                Clear
              </Button>
            }
          />
        </div>
      </Card>

      {/* Account */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white px-4 pt-4 pb-2">
          Account
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <SettingItem
            icon={Shield}
            title="Security"
            description="Manage your account security"
            action={
              <Button variant="ghost" size="sm">
                Manage <ChevronRight size={16} />
              </Button>
            }
          />
          <SettingItem
            icon={LogOut}
            title="Sign Out"
            description="Sign out of your account"
            danger
            action={
              <Button variant="danger" size="sm" onClick={logout}>
                Sign Out
              </Button>
            }
          />
        </div>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-slate-400 dark:text-slate-500 pb-6">
        <p>AuditFlow Pro v2.0.0</p>
        <p className="mt-1">Powered by Netlify</p>
      </div>

      {/* Station Selection Modal */}
      <Modal
        isOpen={showStationModal}
        onClose={() => setShowStationModal(false)}
        title="Select Station"
        size="md"
      >
        <div className="grid grid-cols-2 gap-3">
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => {
                selectStation(station.id);
                setShowStationModal(false);
                toast.success(`Switched to ${station.id}`);
              }}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedStation === station.id
                  ? 'bg-amazon-orange text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <div className="font-semibold">{station.name}</div>
              <div className="text-sm opacity-80">{station.fullName}</div>
            </button>
          ))}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Clear All Data"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            This will permanently delete all your audits, templates, and settings.
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleClearData}
              className="flex-1"
            >
              Delete All
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
