import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Briefcase,
  Eye,
  Check,
  X,
  Info,
  LayoutDashboard,
  ClipboardList,
  FileText,
  AlertCircle,
  BarChart3,
  Users,
  Settings,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, Button, Modal, Badge } from '../components/ui';
import toast from 'react-hot-toast';

// Define all available permissions
const ALL_PERMISSIONS = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'View dashboard and statistics',
    icon: LayoutDashboard,
    category: 'General',
  },
  {
    id: 'audits.view',
    name: 'View Audits',
    description: 'View audit list and details',
    icon: ClipboardList,
    category: 'Audits',
  },
  {
    id: 'audits.create',
    name: 'Create Audits',
    description: 'Create new audits',
    icon: ClipboardList,
    category: 'Audits',
  },
  {
    id: 'audits.edit',
    name: 'Edit Audits',
    description: 'Edit existing audits',
    icon: ClipboardList,
    category: 'Audits',
  },
  {
    id: 'audits.delete',
    name: 'Delete Audits',
    description: 'Delete audits',
    icon: ClipboardList,
    category: 'Audits',
  },
  {
    id: 'templates.view',
    name: 'View Templates',
    description: 'View audit templates',
    icon: FileText,
    category: 'Templates',
  },
  {
    id: 'templates.create',
    name: 'Create Templates',
    description: 'Create new templates',
    icon: FileText,
    category: 'Templates',
  },
  {
    id: 'templates.edit',
    name: 'Edit Templates',
    description: 'Edit existing templates',
    icon: FileText,
    category: 'Templates',
  },
  {
    id: 'templates.delete',
    name: 'Delete Templates',
    description: 'Delete templates',
    icon: FileText,
    category: 'Templates',
  },
  {
    id: 'actions.view',
    name: 'View Actions',
    description: 'View action items',
    icon: AlertCircle,
    category: 'Actions',
  },
  {
    id: 'actions.manage',
    name: 'Manage Actions',
    description: 'Create, edit, and close actions',
    icon: AlertCircle,
    category: 'Actions',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'View analytics and reports',
    icon: BarChart3,
    category: 'Reports',
  },
  {
    id: 'team.view',
    name: 'View Team',
    description: 'View team members',
    icon: Users,
    category: 'Team',
  },
  {
    id: 'users.manage',
    name: 'Manage Users',
    description: 'Add, edit, and remove users',
    icon: Users,
    category: 'Administration',
  },
  {
    id: 'roles.manage',
    name: 'Manage Roles',
    description: 'Edit role permissions',
    icon: Shield,
    category: 'Administration',
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Access system settings',
    icon: Settings,
    category: 'Administration',
  },
];

// Group permissions by category
const groupedPermissions = ALL_PERMISSIONS.reduce((acc, permission) => {
  if (!acc[permission.category]) {
    acc[permission.category] = [];
  }
  acc[permission.category].push(permission);
  return acc;
}, {});

// Define roles with their permissions
const ROLES = [
  {
    id: 'Admin',
    name: 'Administrator',
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
    description: 'Full access to all features',
    isSystem: true,
    permissions: ALL_PERMISSIONS.map(p => p.id), // All permissions
  },
  {
    id: 'Manager',
    name: 'Manager',
    icon: Briefcase,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
    description: 'Manage audits, templates, and view reports',
    isSystem: false,
    permissions: [
      'dashboard',
      'audits.view', 'audits.create', 'audits.edit',
      'templates.view', 'templates.create', 'templates.edit',
      'actions.view', 'actions.manage',
      'analytics',
      'team.view',
    ],
  },
  {
    id: 'Auditor',
    name: 'Auditor',
    icon: ShieldCheck,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    description: 'Perform audits and manage actions',
    isSystem: false,
    permissions: [
      'dashboard',
      'audits.view', 'audits.create', 'audits.edit',
      'templates.view',
      'actions.view', 'actions.manage',
      'team.view',
    ],
  },
  {
    id: 'Viewer',
    name: 'Viewer',
    icon: Eye,
    color: 'text-slate-500',
    bgColor: 'bg-slate-100 dark:bg-slate-700',
    borderColor: 'border-slate-200 dark:border-slate-600',
    description: 'View-only access',
    isSystem: false,
    permissions: [
      'dashboard',
      'audits.view',
      'templates.view',
      'actions.view',
      'team.view',
    ],
  },
];

export default function Permissions() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [roles, setRoles] = useState(ROLES);
  const [selectedRole, setSelectedRole] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(groupedPermissions).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if current user is admin
  const isAdmin = currentUser?.app_metadata?.role === 'Admin' ||
                  currentUser?.user_metadata?.role === 'Admin';

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Toggle permission for a role
  const togglePermission = (roleId, permissionId) => {
    if (!isAdmin) return;

    const role = roles.find(r => r.id === roleId);
    if (role?.isSystem) {
      toast.error('Cannot modify system role permissions');
      return;
    }

    setRoles(prev => prev.map(r => {
      if (r.id === roleId) {
        const hasPermission = r.permissions.includes(permissionId);
        return {
          ...r,
          permissions: hasPermission
            ? r.permissions.filter(p => p !== permissionId)
            : [...r.permissions, permissionId],
        };
      }
      return r;
    }));
    setHasChanges(true);
  };

  // Save changes (in a real app, this would call an API)
  const saveChanges = () => {
    // In a real implementation, this would save to the server
    toast.success('Role permissions saved');
    setHasChanges(false);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setRoles(ROLES);
    setHasChanges(false);
    toast.success('Permissions reset to defaults');
  };

  // Check if role has permission
  const hasPermission = (roleId, permissionId) => {
    const role = roles.find(r => r.id === roleId);
    return role?.permissions.includes(permissionId) || false;
  };

  // If not admin, show access denied
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
            You don't have permission to manage roles and permissions.
            Please contact an administrator if you need access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
            Roles & Permissions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Configure role-based access control
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Info}
            onClick={() => setShowInfoModal(true)}
          >
            How it works
          </Button>
          {hasChanges && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={resetToDefaults}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={saveChanges}
              >
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map(role => {
          const Icon = role.icon;
          const permissionCount = role.permissions.length;
          const totalPermissions = ALL_PERMISSIONS.length;

          return (
            <Card
              key={role.id}
              className={`p-4 cursor-pointer transition-all ${
                selectedRole === role.id
                  ? `ring-2 ring-amazon-orange ${role.bgColor}`
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${role.bgColor}`}>
                  <Icon size={24} className={role.color} />
                </div>
                {role.isSystem && (
                  <Badge size="sm" className="bg-slate-100 dark:bg-slate-700 text-slate-500">
                    <Lock size={10} className="mr-1" />
                    System
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                {role.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                {role.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {permissionCount}/{totalPermissions} permissions
                </span>
                <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      role.id === 'Admin' ? 'bg-amber-500' :
                      role.id === 'Manager' ? 'bg-purple-500' :
                      role.id === 'Auditor' ? 'bg-blue-500' : 'bg-slate-500'
                    }`}
                    style={{ width: `${(permissionCount / totalPermissions) * 100}%` }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Permission Matrix
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Click on a cell to toggle permission (Admin role cannot be modified)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="text-left px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 w-64">
                  Permission
                </th>
                {roles.map(role => {
                  const Icon = role.icon;
                  return (
                    <th
                      key={role.id}
                      className={`px-4 py-3 text-center w-32 ${
                        selectedRole === role.id ? role.bgColor : ''
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Icon size={16} className={role.color} />
                        <span className={`text-sm font-medium ${role.color}`}>
                          {role.name}
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedPermissions).map(([category, permissions]) => (
                <React.Fragment key={category}>
                  {/* Category Header */}
                  <tr>
                    <td
                      colSpan={roles.length + 1}
                      className="bg-slate-100 dark:bg-slate-800/50"
                    >
                      <button
                        onClick={() => toggleCategory(category)}
                        className="flex items-center gap-2 w-full px-4 py-2 text-left"
                      >
                        {expandedCategories[category] ? (
                          <ChevronDown size={16} className="text-slate-400" />
                        ) : (
                          <ChevronRight size={16} className="text-slate-400" />
                        )}
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {category}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({permissions.length})
                        </span>
                      </button>
                    </td>
                  </tr>

                  {/* Permission Rows */}
                  <AnimatePresence>
                    {expandedCategories[category] && permissions.map(permission => {
                      const PermIcon = permission.icon;
                      return (
                        <motion.tr
                          key={permission.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="border-b border-slate-100 dark:border-slate-800"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <PermIcon size={16} className="text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                  {permission.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          {roles.map(role => {
                            const hasPerm = hasPermission(role.id, permission.id);
                            return (
                              <td
                                key={role.id}
                                className={`px-4 py-3 text-center ${
                                  selectedRole === role.id ? role.bgColor : ''
                                }`}
                              >
                                <button
                                  onClick={() => togglePermission(role.id, permission.id)}
                                  disabled={role.isSystem}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                    role.isSystem
                                      ? 'cursor-not-allowed'
                                      : 'cursor-pointer hover:scale-110'
                                  } ${
                                    hasPerm
                                      ? role.id === 'Admin' ? 'bg-amber-500 text-white' :
                                        role.id === 'Manager' ? 'bg-purple-500 text-white' :
                                        role.id === 'Auditor' ? 'bg-blue-500 text-white' :
                                        'bg-slate-500 text-white'
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                  }`}
                                >
                                  {hasPerm ? (
                                    <Check size={16} />
                                  ) : (
                                    <X size={16} />
                                  )}
                                </button>
                              </td>
                            );
                          })}
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Info Modal */}
      <Modal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="How Role-Based Access Control Works"
        size="md"
      >
        <div className="space-y-4 text-slate-600 dark:text-slate-300">
          <p>
            Role-Based Access Control (RBAC) allows you to manage what users can see and do
            based on their assigned role.
          </p>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white">Available Roles:</h4>

            {roles.map(role => {
              const Icon = role.icon;
              return (
                <div key={role.id} className={`p-3 rounded-lg ${role.bgColor}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={16} className={role.color} />
                    <span className={`font-medium ${role.color}`}>{role.name}</span>
                    {role.isSystem && (
                      <Badge size="sm" className="bg-white/50 dark:bg-black/20">
                        System
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm opacity-80">{role.description}</p>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm">
              <strong>Note:</strong> The Administrator role has full access to all features
              and cannot be modified. This ensures there's always a role with complete
              system access.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="primary"
            onClick={() => setShowInfoModal(false)}
            className="w-full"
          >
            Got it
          </Button>
        </div>
      </Modal>
    </div>
  );
}
