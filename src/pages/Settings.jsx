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
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAudits } from '../context/AuditContext';
import { useLanguage, languages } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Card, Button, Modal } from '../components/ui';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, selectedStation, stations, selectStation, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { audits, templates } = useAudits();
  const { currentLanguage, changeLanguage, getCurrentLanguageInfo } = useLanguage();
  const { t } = useTranslation();
  const [showStationModal, setShowStationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleExportData = () => {
    const data = {
      audits,
      templates,
      exportDate: new Date().toISOString(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `audithub_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success(t('toast.dataExported'));
  };

  const handleClearData = () => {
    localStorage.clear();
    toast.success(t('toast.dataCleared'));
    setShowDeleteModal(false);
    window.location.reload();
  };

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    const langInfo = languages.find(l => l.code === langCode);
    toast.success(t('toast.languageChanged', { language: langInfo?.nativeName }));
    setShowLanguageModal(false);
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
          {t('settings.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {t('settings.subtitle')}
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
                {user?.user_metadata?.full_name || t('common.user')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <SettingItem
            icon={MapPin}
            title={t('settings.profile.currentStation')}
            description={selectedStation || t('settings.profile.noStationSelected')}
            action={
              <Button variant="ghost" size="sm" onClick={() => setShowStationModal(true)}>
                {t('common.change')} <ChevronRight size={16} />
              </Button>
            }
          />
        </div>
      </Card>

      {/* Appearance */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white px-4 pt-4 pb-2">
          {t('settings.appearance.title')}
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <SettingItem
            icon={isDark ? Moon : Sun}
            title={t('settings.appearance.darkMode')}
            description={isDark ? t('settings.appearance.darkEnabled') : t('settings.appearance.lightEnabled')}
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
            title={t('settings.appearance.language')}
            description={`${getCurrentLanguageInfo().flag} ${getCurrentLanguageInfo().nativeName}`}
            action={
              <Button variant="ghost" size="sm" onClick={() => setShowLanguageModal(true)}>
                {t('common.change')} <ChevronRight size={16} />
              </Button>
            }
          />
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white px-4 pt-4 pb-2">
          {t('settings.notifications.title')}
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <SettingItem
            icon={Bell}
            title={t('settings.notifications.push')}
            description={t('settings.notifications.pushDescription')}
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
          {t('settings.dataManagement.title')}
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <SettingItem
            icon={Download}
            title={t('settings.dataManagement.export')}
            description={t('settings.dataManagement.exportDescription')}
            action={
              <Button variant="secondary" size="sm" onClick={handleExportData}>
                {t('common.export')}
              </Button>
            }
          />
          <SettingItem
            icon={Database}
            title={t('settings.dataManagement.storage')}
            description={t('settings.dataManagement.storageDescription', { audits: audits.length, templates: templates.length })}
            action={null}
          />
          <SettingItem
            icon={Trash2}
            title={t('settings.dataManagement.clearData')}
            description={t('settings.dataManagement.clearDataDescription')}
            danger
            action={
              <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                {t('common.clear')}
              </Button>
            }
          />
        </div>
      </Card>

      {/* Account */}
      <Card>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white px-4 pt-4 pb-2">
          {t('settings.account.title')}
        </h2>
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          <SettingItem
            icon={Shield}
            title={t('settings.account.security')}
            description={t('settings.account.securityDescription')}
            action={
              <Button variant="ghost" size="sm">
                {t('common.manage')} <ChevronRight size={16} />
              </Button>
            }
          />
          <SettingItem
            icon={LogOut}
            title={t('common.signOut')}
            description={t('settings.account.securityDescription')}
            danger
            action={
              <Button variant="danger" size="sm" onClick={logout}>
                {t('common.signOut')}
              </Button>
            }
          />
        </div>
      </Card>

      {/* App Info */}
      <div className="text-center text-sm text-slate-400 dark:text-slate-500 pb-6">
        <p>AuditHub v2.0.0</p>
        <p className="mt-1">Powered by Netlify</p>
      </div>

      {/* Station Selection Modal */}
      <Modal
        isOpen={showStationModal}
        onClose={() => setShowStationModal(false)}
        title={t('settings.modals.selectStation')}
        size="md"
      >
        <div className="grid grid-cols-2 gap-3">
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => {
                selectStation(station.id);
                setShowStationModal(false);
                toast.success(t('toast.stationChanged', { station: station.id }));
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

      {/* Language Selection Modal */}
      <Modal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
        title={t('settings.appearance.language')}
        size="sm"
      >
        <div className="space-y-2">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {t('settings.appearance.languageDescription')}
          </p>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between ${
                currentLanguage === lang.code
                  ? 'bg-amazon-orange text-white'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <div className="font-semibold">{lang.nativeName}</div>
                  <div className="text-sm opacity-80">{lang.name}</div>
                </div>
              </div>
              {currentLanguage === lang.code && (
                <Check size={20} className="flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('settings.modals.clearAllData')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-400">
            {t('settings.dataManagement.confirmClear')}
          </p>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleClearData}
              className="flex-1"
            >
              {t('settings.modals.deleteAll')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
