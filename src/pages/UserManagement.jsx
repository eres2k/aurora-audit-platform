import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronDown,
  UserPlus,
  RefreshCw,
  Check,
  X,
  Crown,
  Eye,
  Briefcase,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { usersApi } from '../utils/api';
import { Card, Button, Modal, Badge } from '../components/ui';
import { SkeletonListItem } from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

// Available roles with their permissions
const AVAILABLE_ROLES = [
  {
    id: 'Admin',
    name: 'Administrator',
    icon: Crown,
    color: 'text-amber-500',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    description: 'Full access to all features including user management',
    permissions: ['all'],
  },
  {
    id: 'Manager',
    name: 'Manager',
    icon: Briefcase,
    color: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    description: 'Can manage audits, templates, and view reports',
    permissions: ['audits', 'templates', 'actions', 'analytics', 'team'],
  },
  {
    id: 'Auditor',
    name: 'Auditor',
    icon: ShieldCheck,
    color: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    description: 'Can perform audits and manage actions',
    permissions: ['audits', 'actions'],
  },
  {
    id: 'Viewer',
    name: 'Viewer',
    icon: Eye,
    color: 'text-slate-500',
    bgColor: 'bg-slate-100 dark:bg-slate-700',
    description: 'Can only view audits and reports',
    permissions: ['view'],
  },
];

const getRoleConfig = (roleId) => {
  return AVAILABLE_ROLES.find(r => r.id === roleId) || AVAILABLE_ROLES[2]; // Default to Auditor
};

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRole, setEditingRole] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Check if current user is admin - check multiple possible locations for role
  const getUserRole = (user) => {
    if (user?.app_metadata?.role) return user.app_metadata.role;
    if (user?.app_metadata?.roles?.length > 0) return user.app_metadata.roles[0];
    if (user?.user_metadata?.role) return user.user_metadata.role;
    if (user?.user_metadata?.roles?.length > 0) return user.user_metadata.roles[0];
    return null;
  };

  const currentUserRole = getUserRole(currentUser);
  const isAdmin = currentUserRole === 'Admin' || currentUserRole === 'admin';

  // Load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.getAll();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle role update
  const handleUpdateRole = async () => {
    if (!selectedUser || !editingRole) return;

    setIsSaving(true);
    try {
      await usersApi.update(selectedUser.id, { role: editingRole });

      // Update local state
      setUsers(prev => prev.map(u =>
        u.id === selectedUser.id ? { ...u, role: editingRole } : u
      ));

      toast.success(`Role updated to ${editingRole}`);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      await usersApi.delete(selectedUser.id);
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
      toast.success('User removed');
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to remove user');
    } finally {
      setIsSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditingRole(user.role || 'Auditor');
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
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
            You don't have permission to access user management.
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
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage users and their roles
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={loadUsers}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {AVAILABLE_ROLES.map(role => {
          const count = users.filter(u => u.role === role.id).length;
          const Icon = role.icon;
          return (
            <Card key={role.id} className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${role.bgColor}`}>
                  <Icon size={20} className={role.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {count}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {role.name}s
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amazon-orange/50"
            />
          </div>
        </div>
      </Card>

      {/* Users List */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            All Users ({filteredUsers.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <SkeletonListItem key={i} />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              {searchQuery ? 'No users match your search' : 'No users found'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            <AnimatePresence>
              {filteredUsers.map((user, index) => {
                const roleConfig = getRoleConfig(user.role);
                const RoleIcon = roleConfig.icon;
                const isCurrentUser = user.id === currentUser?.id;

                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amazon-orange to-amazon-teal flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                        {isCurrentUser && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-slate-900 dark:text-white truncate">
                            {user.name || 'Unnamed User'}
                          </h3>
                          {isCurrentUser && (
                            <Badge size="sm" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                              You
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 truncate">
                            <Mail size={14} />
                            {user.email}
                          </span>
                        </div>
                      </div>

                      {/* Role Badge */}
                      <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg ${roleConfig.bgColor}`}>
                        <RoleIcon size={16} className={roleConfig.color} />
                        <span className={`text-sm font-medium ${roleConfig.color}`}>
                          {roleConfig.name}
                        </span>
                      </div>

                      {/* Last Activity */}
                      <div className="hidden md:block text-right">
                        <p className="text-xs text-slate-400 dark:text-slate-500">Last active</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {formatTimeAgo(user.lastLoginAt)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Edit role"
                        >
                          <Edit2 size={18} className="text-slate-500" />
                        </motion.button>
                        {!isCurrentUser && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openDeleteModal(user)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Remove user"
                          >
                            <Trash2 size={18} className="text-red-500" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Role Badge */}
                    <div className="sm:hidden mt-3 flex items-center justify-between">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${roleConfig.bgColor}`}>
                        <RoleIcon size={14} className={roleConfig.color} />
                        <span className={`text-xs font-medium ${roleConfig.color}`}>
                          {roleConfig.name}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatTimeAgo(user.lastLoginAt)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User Role"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amazon-orange to-amazon-teal flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {selectedUser.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {selectedUser.name}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedUser.email}
                </p>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Select Role
              </label>
              <div className="space-y-2">
                {AVAILABLE_ROLES.map(role => {
                  const Icon = role.icon;
                  const isSelected = editingRole === role.id;

                  return (
                    <button
                      key={role.id}
                      onClick={() => setEditingRole(role.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-amazon-orange bg-amazon-orange/5'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${role.bgColor}`}>
                          <Icon size={20} className={role.color} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-slate-900 dark:text-white">
                              {role.name}
                            </h4>
                            {isSelected && (
                              <Check size={16} className="text-amazon-orange" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {role.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateRole}
                disabled={isSaving || editingRole === selectedUser.role}
                className="flex-1"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Remove User"
        size="sm"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <p className="text-slate-700 dark:text-slate-300">
                Are you sure you want to remove <strong>{selectedUser.name}</strong> from the system?
                This will delete their user record but won't affect their authentication account.
              </p>
            </div>
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
                onClick={handleDeleteUser}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? 'Removing...' : 'Remove User'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
