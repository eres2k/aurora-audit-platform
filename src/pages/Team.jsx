import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Mail,
  MapPin,
  Shield,
  Crown,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Badge } from '../components/ui';

export default function Team() {
  const { user, selectedStation } = useAuth();

  // Mock team data - in production this would come from an API
  const teamMembers = [
    {
      id: 1,
      name: user?.user_metadata?.full_name || 'Current User',
      email: user?.email || 'user@example.com',
      role: 'Admin',
      station: selectedStation || 'DVI1',
      auditsCompleted: 24,
      avatar: null,
      isCurrentUser: true,
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      role: 'Auditor',
      station: 'DVI2',
      auditsCompleted: 18,
      avatar: null,
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@company.com',
      role: 'Auditor',
      station: 'DAP5',
      auditsCompleted: 32,
      avatar: null,
    },
    {
      id: 4,
      name: 'Emily Brown',
      email: 'emily.brown@company.com',
      role: 'Supervisor',
      station: 'DVI1',
      auditsCompleted: 45,
      avatar: null,
    },
  ];

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
        <Button variant="primary" icon={UserPlus}>
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{teamMembers.length}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Team Members</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-purple-500">1</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Admins</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-blue-500">1</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Supervisors</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-green-500">2</div>
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
              </Card>
            </motion.div>
          );
        })}
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
              Team management features are in development. Soon you'll be able to invite team members,
              assign roles, and manage permissions across stations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
