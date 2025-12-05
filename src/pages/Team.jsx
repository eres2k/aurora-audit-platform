import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Mail,
  MapPin,
  Shield,
  Crown,
  UserPlus,
  Trash2,
  AlertTriangle,
  X,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge } from '../components/ui';
import { usersApi } from '../utils/api';

// Default team members
const DEFAULT_TEAM_MEMBERS = [
  {
    id: 'default-1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    role: 'Auditor',
    station: 'DVI2',
    auditsCompleted: 18,
    avatar: null,
    isDefault: true,
  },
  {
    id: 'default-2',
    name: 'Mike Chen',
    email: 'mike.chen@company.com',
    role: 'Auditor',
    station: 'DAP5',
    auditsCompleted: 32,
    avatar: null,
    isDefault: true,
  },
  {
    id: 'default-3',
    name: 'Emily Brown',
    email: 'emily.brown@company.com',
    role: 'Supervisor',
    station: 'DVI1',
    auditsCompleted: 45,
    avatar: null,
    isDefault: true,
  },
];

export default function Team() {
  const { user, selectedStation, userRole, isAdmin } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, member: null });

  // Current user member with actual role from context
  const currentUserMember = {
    id: 'current-user',
    name: user?.user_metadata?.full_name || 'Current User',
    email: user?.email || 'user@example.com',
    role: userRole || user?.app_metadata?.role || 'Admin',
    station: selectedStation || 'DVI1',
    auditsCompleted: 24,
    avatar: null,
    isCurrentUser: true,
  };

  // Fetch registered users from server
  const fetchRegisteredUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await usersApi.getAll();
      const users = response.users || [];
      // Filter out current user (they're shown separately)
      const otherUsers = users.filter(u => u.id !== user?.id);
      setRegisteredUsers(otherUsers);
    } catch (error) {
      console.error('Failed to fetch registered users:', error);
    }
    setLoadingUsers(false);
  };

  // Load team members from local storage and fetch registered users
  useEffect(() => {
    const loadTeamMembers = () => {
      const savedMembers = localStorage.getItem('teamMembers');
      const deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaultTeamMembers') || '[]');

      if (savedMembers) {
        const parsed = JSON.parse(savedMembers);
        // Filter out deleted defaults and merge with remaining defaults
        const remainingDefaults = DEFAULT_TEAM_MEMBERS.filter(m => !deletedDefaults.includes(m.id));
        const customMembers = parsed.filter(m => !m.isDefault);
        setTeamMembers([currentUserMember, ...remainingDefaults, ...customMembers]);
      } else {
        // First load - filter out deleted defaults
        const remainingDefaults = DEFAULT_TEAM_MEMBERS.filter(m => !deletedDefaults.includes(m.id));
        setTeamMembers([currentUserMember, ...remainingDefaults]);
      }
    };
    loadTeamMembers();

    // Fetch registered users
    if (user) {
      fetchRegisteredUsers();
    }
  }, [user, selectedStation]);

  // Save team members to local storage (excluding current user and defaults)
  const saveTeamMembers = (members) => {
    const customMembers = members.filter(m => !m.isCurrentUser && !m.isDefault);
    localStorage.setItem('teamMembers', JSON.stringify(customMembers));
  };

  // Use isAdmin from context (already imported)

  // Delete team member
  const handleDeleteMember = (member) => {
    if (member.isCurrentUser) {
      toast.error("You can't delete yourself");
      return;
    }
    setDeleteModal({ open: true, member });
  };

  const confirmDelete = () => {
    const member = deleteModal.member;
    if (!member) return;

    // If it's a default member, track the deletion
    if (member.isDefault) {
      const deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaultTeamMembers') || '[]');
      if (!deletedDefaults.includes(member.id)) {
        deletedDefaults.push(member.id);
        localStorage.setItem('deletedDefaultTeamMembers', JSON.stringify(deletedDefaults));
      }
    }

    const updated = teamMembers.filter(m => m.id !== member.id);
    setTeamMembers(updated);
    saveTeamMembers(updated);
    toast.success(`${member.name} has been removed from the team`);
    setDeleteModal({ open: false, member: null });
  };

  // Restore default team members
  const restoreDefaultMembers = () => {
    localStorage.removeItem('deletedDefaultTeamMembers');
    const customMembers = teamMembers.filter(m => !m.isCurrentUser && !m.isDefault);
    const restored = [currentUserMember, ...DEFAULT_TEAM_MEMBERS, ...customMembers];
    setTeamMembers(restored);
    saveTeamMembers(restored);
    toast.success('Default team members restored');
  };

  // Check if any defaults are deleted
  const hasDeletedDefaults = () => {
    const deletedDefaults = JSON.parse(localStorage.getItem('deletedDefaultTeamMembers') || '[]');
    return deletedDefaults.length > 0;
  };

  const getRoleConfig = (role) => {
    const configs = {
      Admin: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Crown },
      Supervisor: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Shield },
      Auditor: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Users },
    };
    return configs[role] || configs.Auditor;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
            Team
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage team members and permissions
          </p>
        </div>
        <div className="flex gap-2">
          {hasDeletedDefaults() && (
            <Button variant="secondary" icon={RotateCcw} onClick={restoreDefaultMembers}>
              Restore Defaults
            </Button>
          )}
          <Button variant="primary" icon={UserPlus}>
            Invite Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{teamMembers.length + registeredUsers.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Team Members</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-purple-500">{teamMembers.filter(m => m.role === 'Admin').length + registeredUsers.filter(u => u.role === 'Admin').length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Admins</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-blue-500">{teamMembers.filter(m => m.role === 'Supervisor').length + registeredUsers.filter(u => u.role === 'Supervisor').length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Supervisors</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-green-500">{teamMembers.filter(m => m.role === 'Auditor').length + registeredUsers.filter(u => u.role === 'Auditor').length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Auditors</div>
        </Card>
      </div>

      {/* Team Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member, index) => {
          const roleConfig = getRoleConfig(member.role);
          const RoleIcon = roleConfig.icon;

          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amazon-orange to-amazon-teal flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {member.name}
                      </h3>
                      {member.isCurrentUser && (
                        <Badge variant="primary" size="sm">You</Badge>
                      )}
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${roleConfig.color}`}>
                      <RoleIcon size={12} />
                      {member.role}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Mail size={14} />
                    <span className="truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <MapPin size={14} />
                    <span>{member.station}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-500 dark:text-slate-400">Audits completed</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{member.auditsCompleted}</span>
                  </div>
                </div>

                {/* Delete button - only for admins and not for self */}
                {isAdmin && !member.isCurrentUser && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                      onClick={() => handleDeleteMember(member)}
                      className="w-full flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                      Remove Member
                    </button>
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}

        {/* Registered Users from Server */}
        {registeredUsers.map((regUser, index) => {
          const roleConfig = getRoleConfig(regUser.role);
          const RoleIcon = roleConfig.icon;

          return (
            <motion.div
              key={regUser.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (teamMembers.length + index) * 0.05 }}
            >
              <Card className="p-5 border-l-4 border-l-amazon-teal">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amazon-teal to-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">
                      {regUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {regUser.name}
                      </h3>
                      <Badge variant="info" size="sm">Registered</Badge>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${roleConfig.color}`}>
                      <RoleIcon size={12} />
                      {regUser.role}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Mail size={14} />
                    <span className="truncate">{regUser.email}</span>
                  </div>
                  {regUser.lastLoginAt && (
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      Last login: {new Date(regUser.lastLoginAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}

        {/* Loading indicator */}
        {loadingUsers && (
          <Card className="p-5 flex items-center justify-center">
            <RefreshCw size={24} className="text-slate-400 animate-spin" />
            <span className="ml-2 text-slate-500">Loading users...</span>
          </Card>
        )}
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-gradient-to-r from-amazon-orange/10 to-amazon-teal/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amazon-orange/20 rounded-xl">
            <Users size={24} className="text-amazon-orange" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Team Management</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              As an admin, you can manage your team by removing members.
              Invite functionality will be available soon.
            </p>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteModal({ open: false, member: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Remove Team Member
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This action cannot be undone
                  </p>
                </div>
                <button
                  onClick={() => setDeleteModal({ open: false, member: null })}
                  className="ml-auto p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <p className="text-slate-600 dark:text-slate-300 mb-6">
                Are you sure you want to remove <strong>{deleteModal.member?.name}</strong> from the team?
                {deleteModal.member?.isDefault && (
                  <span className="block mt-2 text-sm text-amber-600 dark:text-amber-400">
                    Note: You can restore default team members using the "Restore Defaults" button.
                  </span>
                )}
              </p>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteModal({ open: false, member: null })}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
