import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight, Menu, X, Plus, Edit, Trash2, Download, Upload, Camera, FileText, Check, AlertCircle, Info, Search, Filter, Save, LogOut, User, Settings, Sun, Moon, Wifi, WifiOff, Home, ClipboardList, HelpCircle, FileSpreadsheet, Layout, Archive, Users, Building, MapPin, Calendar, Clock, Star, ThumbsUp, MessageSquare, Eye, Copy, Share2, Printer, Lock, Unlock, Paperclip, Folder, File, TrendingUp, BarChart, PieChart, Activity, Bell, BellOff, Shield, UserPlus, RefreshCw, ZoomIn, ZoomOut, RotateCw, Image, Crop, Palette, Brush, Type, Grid, List, ChevronLeft, MoreVertical, ExternalLink, GitBranch, Package, Layers, Code, Terminal, Database, Cloud, CloudOff, HardDrive, Cpu, Zap, Battery, BatteryCharging, Bluetooth, Cast, Compass, Navigation, Map, Flag, Target, Award, Gift, Heart, AlertTriangle, XCircle, CheckCircle, HelpCircle as QuestionCircle, Info as InfoIcon, MoreHorizontal, Send, Inbox, Mail, MessageCircle, Phone, Video, Mic, MicOff, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, Rewind, FastForward, Square, Circle, Triangle, Hexagon, Octagon, Star as StarIcon, Hash, AtSign, DollarSign, Percent, PlusCircle, MinusCircle, XSquare, CheckSquare, Clipboard, BookOpen, Book, Bookmark, Tag, Tags, ShoppingCart, ShoppingBag, Package as PackageIcon, Box, Briefcase, Folder as FolderIcon, FolderOpen, FolderPlus, FilePlus, FileCheck, FileMinus, FileX, FileCode, FileImage } from 'lucide-react';

// Main Application Component
export default function AuroraAuditPlatform() {
  // State Management
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [audits, setAudits] = useState([]);
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showNewAuditModal, setShowNewAuditModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('info');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const fileInputRef = useRef(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [auditFormData, setAuditFormData] = useState({
    title: '',
    description: '',
    template: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    department: '',
    location: ''
  });

  // Initialize app
  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load sample data
    loadSampleData();

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }

    // Simulate user login for demo
    setTimeout(() => {
      setUser({
        id: '1',
        name: 'John Doe',
        email: 'john.doe@aurora.com',
        role: 'admin',
        avatar: null
      });
      notify('Welcome back, John!', 'success');
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load sample data
  const loadSampleData = () => {
    // Sample audits
    const sampleAudits = [
      {
        id: '1',
        title: 'Q1 2025 Safety Audit',
        description: 'Quarterly safety inspection of main facility',
        status: 'in_progress',
        progress: 65,
        assignedTo: 'John Doe',
        createdBy: 'Admin',
        dueDate: '2025-03-31',
        department: 'Operations',
        location: 'Main Facility',
        priority: 'high',
        questionsCompleted: 13,
        totalQuestions: 20,
        createdAt: '2025-01-15',
        updatedAt: '2025-08-10',
        tags: ['safety', 'quarterly', 'mandatory']
      },
      {
        id: '2',
        title: 'Annual Compliance Review',
        description: 'Yearly compliance check for regulatory requirements',
        status: 'completed',
        progress: 100,
        assignedTo: 'Jane Smith',
        createdBy: 'Admin',
        dueDate: '2025-02-28',
        department: 'Legal',
        location: 'Corporate Office',
        priority: 'medium',
        questionsCompleted: 50,
        totalQuestions: 50,
        createdAt: '2025-01-01',
        updatedAt: '2025-02-25',
        tags: ['compliance', 'annual', 'legal']
      },
      {
        id: '3',
        title: 'Equipment Maintenance Check',
        description: 'Monthly equipment inspection and maintenance verification',
        status: 'draft',
        progress: 0,
        assignedTo: 'Mike Johnson',
        createdBy: 'Supervisor',
        dueDate: '2025-04-15',
        department: 'Maintenance',
        location: 'Warehouse A',
        priority: 'low',
        questionsCompleted: 0,
        totalQuestions: 30,
        createdAt: '2025-08-01',
        updatedAt: '2025-08-01',
        tags: ['maintenance', 'equipment', 'monthly']
      },
      {
        id: '4',
        title: 'Quality Control Inspection',
        description: 'Product quality assessment and control measures',
        status: 'in_progress',
        progress: 45,
        assignedTo: 'Sarah Wilson',
        createdBy: 'QC Manager',
        dueDate: '2025-03-15',
        department: 'Quality',
        location: 'Production Floor',
        priority: 'high',
        questionsCompleted: 9,
        totalQuestions: 20,
        createdAt: '2025-02-20',
        updatedAt: '2025-08-08',
        tags: ['quality', 'production', 'inspection']
      }
    ];
    setAudits(sampleAudits);

    // Sample questions
    const sampleQuestions = [
      { id: '1', text: 'Are all emergency exits clearly marked and unobstructed?', type: 'boolean', category: 'Safety', required: true },
      { id: '2', text: 'Number of fire extinguishers on the floor', type: 'number', category: 'Safety', required: true },
      { id: '3', text: 'Date of last safety inspection', type: 'date', category: 'Compliance', required: true },
      { id: '4', text: 'Inspector comments and observations', type: 'text', category: 'General', required: false },
      { id: '5', text: 'Upload photos of any issues found', type: 'file', category: 'Documentation', required: false },
      { id: '6', text: 'Overall safety rating', type: 'select', category: 'Safety', options: ['Excellent', 'Good', 'Fair', 'Poor'], required: true },
      { id: '7', text: 'Areas requiring immediate attention', type: 'multiselect', category: 'Safety', options: ['Exits', 'Equipment', 'Signage', 'Lighting', 'Ventilation'], required: false },
      { id: '8', text: 'Is personal protective equipment available?', type: 'boolean', category: 'Safety', required: true },
      { id: '9', text: 'Temperature reading (°F)', type: 'number', category: 'Environment', required: false },
      { id: '10', text: 'Compliance certificates up to date?', type: 'boolean', category: 'Compliance', required: true }
    ];
    setQuestions(sampleQuestions);

    // Sample templates
    const sampleTemplates = [
      { id: '1', name: 'Safety Inspection', description: 'Standard safety audit template for facility inspections', questionCount: 25, category: 'Safety', icon: Shield },
      { id: '2', name: 'Quality Control', description: 'Product quality assessment and control measures', questionCount: 30, category: 'Quality', icon: CheckCircle },
      { id: '3', name: 'Compliance Review', description: 'Regulatory compliance check template', questionCount: 40, category: 'Legal', icon: FileCheck },
      { id: '4', name: 'Equipment Maintenance', description: 'Equipment inspection and maintenance verification', questionCount: 20, category: 'Maintenance', icon: Settings },
      { id: '5', name: 'Environmental Audit', description: 'Environmental impact and sustainability assessment', questionCount: 35, category: 'Environment', icon: Zap },
      { id: '6', name: 'Security Assessment', description: 'Physical and digital security evaluation', questionCount: 45, category: 'Security', icon: Lock }
    ];
    setTemplates(sampleTemplates);
  };

  // Notification function
  const notify = (message, type = 'info') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString()
    }));
    setUploadedImages([...uploadedImages, ...newImages]);
    notify(`${files.length} image(s) uploaded successfully`, 'success');
  };

  // Filter audits based on search and status
  const filteredAudits = audits.filter(audit => {
    const matchesSearch = audit.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          audit.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          audit.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || audit.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Dashboard stats
  const stats = {
    total: audits.length,
    inProgress: audits.filter(a => a.status === 'in_progress').length,
    completed: audits.filter(a => a.status === 'completed').length,
    draft: audits.filter(a => a.status === 'draft').length,
    overdue: audits.filter(a => new Date(a.dueDate) < new Date() && a.status !== 'completed').length,
    highPriority: audits.filter(a => a.priority === 'high').length
  };

  // Sidebar navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null },
    { id: 'audits', label: 'Audits', icon: ClipboardList, badge: stats.inProgress },
    { id: 'questions', label: 'Questions', icon: HelpCircle, badge: questions.length },
    { id: 'templates', label: 'Templates', icon: Layout, badge: templates.length },
    { id: 'reports', label: 'Reports', icon: FileText, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  // Render sidebar
  const renderSidebar = () => (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              A
            </div>
            {sidebarOpen && (
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Aurora
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hidden lg:block"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center ${!sidebarOpen ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  currentView === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                </div>
                {sidebarOpen && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    currentView === item.id
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Storage Used</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">75%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">7.5 GB of 10 GB used</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render header
  const renderHeader = () => (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {navItems.find(item => item.id === currentView)?.label || 'Dashboard'}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Online/Offline Status */}
          <div className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
            isOnline 
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
          }`}>
            {isOnline ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Role'}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3">
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
                <button 
                  onClick={() => {
                    setUser(null);
                    notify('Logged out successfully', 'info');
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // Render dashboard
  const renderDashboard = () => (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user?.name || 'User'}! 👋
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening with your audits today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <ClipboardList className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.total}</span>
          </div>
          <p className="text-blue-100">Total Audits</p>
          <p className="text-sm text-blue-200 mt-2">+12% from last month</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.inProgress}</span>
          </div>
          <p className="text-amber-100">In Progress</p>
          <p className="text-sm text-amber-200 mt-2">2 due this week</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.completed}</span>
          </div>
          <p className="text-green-100">Completed</p>
          <p className="text-sm text-green-200 mt-2">Great job!</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <AlertTriangle className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.overdue}</span>
          </div>
          <p className="text-red-100">Overdue</p>
          <p className="text-sm text-red-200 mt-2">Needs attention</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Audits */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Audits</h3>
              <button
                onClick={() => setCurrentView('audits')}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View all →
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {audits.slice(0, 3).map(audit => (
                <div key={audit.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">{audit.title}</h4>
                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {audit.assignedTo}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(audit.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{audit.progress}%</p>
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                          style={{ width: `${audit.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      audit.status === 'completed' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : audit.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {audit.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowNewAuditModal(true)}
                className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">New Audit</p>
              </button>
              <button className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
                <Upload className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Import</p>
              </button>
              <button className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Reports</p>
              </button>
              <button className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
                <Layout className="w-6 h-6 text-orange-600 dark:text-orange-400 mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">Templates</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render audits view
  const renderAudits = () => (
    <div className="p-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search audits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="w-5 h-5" />
          </button>
          <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowNewAuditModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Audit</span>
          </button>
        </div>
      </div>

      {/* Audits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAudits.map(audit => (
          <div
            key={audit.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              {/* Audit Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {audit.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {audit.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  audit.priority === 'high' 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : audit.priority === 'medium'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {audit.priority}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {audit.questionsCompleted}/{audit.totalQuestions} questions
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${audit.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Audit Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <User className="w-4 h-4 mr-2" />
                  {audit.assignedTo}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Building className="w-4 h-4 mr-2" />
                  {audit.department}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  {audit.location}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  Due: {new Date(audit.dueDate).toLocaleDateString()}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {audit.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setSelectedAudit(audit)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  audit.status === 'completed' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : audit.status === 'in_progress'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {audit.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render questions view
  const renderQuestions = () => (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Question Bank</h3>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Import Excel</span>
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Question</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Required</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map(question => (
                  <tr key={question.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{question.text}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full">
                        {question.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{question.category}</td>
                    <td className="py-3 px-4">
                      {question.required ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  // Render templates view
  const renderTemplates = () => (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => {
          const Icon = template.icon;
          return (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                    <Icon className="w-6 h-6" />
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {template.questionCount} questions
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
                    Use Template →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Main Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:flex flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          {renderSidebar()}
        </aside>

        {/* Mobile Sidebar */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)}></div>
            <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              {renderSidebar()}
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          {renderHeader()}

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'audits' && renderAudits()}
            {currentView === 'questions' && renderQuestions()}
            {currentView === 'templates' && renderTemplates()}
            {currentView === 'reports' && (
              <div className="p-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Reports Section</h3>
                  <p className="text-gray-600 dark:text-gray-400">Generate and export professional PDF reports</p>
                </div>
              </div>
            )}
            {currentView === 'settings' && (
              <div className="p-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <Settings className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Settings</h3>
                  <p className="text-gray-600 dark:text-gray-400">Configure your audit platform preferences</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* New Audit Modal */}
      {showNewAuditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewAuditModal(false)}></div>
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Audit</h2>
                <button
                  onClick={() => setShowNewAuditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Audit Title *
                  </label>
                  <input
                    type="text"
                    value={auditFormData.title}
                    onChange={(e) => setAuditFormData({...auditFormData, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter audit title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={auditFormData.description}
                    onChange={(e) => setAuditFormData({...auditFormData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    rows="3"
                    placeholder="Enter audit description"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Template
                    </label>
                    <select
                      value={auditFormData.template}
                      onChange={(e) => setAuditFormData({...auditFormData, template: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Select template</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={auditFormData.assignedTo}
                      onChange={(e) => setAuditFormData({...auditFormData, assignedTo: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                      placeholder="Assign to user"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={auditFormData.dueDate}
                      onChange={(e) => setAuditFormData({...auditFormData, dueDate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={auditFormData.priority}
                      onChange={(e) => setAuditFormData({...auditFormData, priority: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={auditFormData.department}
                      onChange={(e) => setAuditFormData({...auditFormData, department: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                      placeholder="Enter department"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={auditFormData.location}
                      onChange={(e) => setAuditFormData({...auditFormData, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Attachments
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Camera className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Drag and drop images here, or click to browse
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    >
                      Choose Files
                    </button>
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {uploadedImages.map(image => (
                        <div key={image.id} className="relative group">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setUploadedImages(uploadedImages.filter(img => img.id !== image.id))}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowNewAuditModal(false)}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      notify('Audit created successfully!', 'success');
                      setShowNewAuditModal(false);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-shadow"
                  >
                    Create Audit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {showNotification && (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center p-4 rounded-lg shadow-lg ${
          notificationType === 'success' 
            ? 'bg-green-500 text-white' 
            : notificationType === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          {notificationType === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
          {notificationType === 'error' && <XCircle className="w-5 h-5 mr-2" />}
          {notificationType === 'info' && <InfoIcon className="w-5 h-5 mr-2" />}
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* PWA Install Prompt */}
      <div className="hidden">
        <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-sm">
          <p className="text-sm text-gray-900 dark:text-white mb-3">
            Install Aurora Audit Platform for a better experience
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg">Install</button>
            <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">Not now</button>
          </div>
        </div>
      </div>
    </div>
  );
}