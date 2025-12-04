import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  User,
  Calendar,
  ChevronRight,
  Download,
  Plus,
  Trash2,
  Users,
  Filter,
  ClipboardList,
  Hash,
} from 'lucide-react';
import { useAudits } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Badge, Modal } from '../components/ui';
import { generateActionsPDF } from '../utils/pdfExport';
import toast from 'react-hot-toast';

// Owner options for actions
const OWNER_OPTIONS = ['OPS', 'ACES', 'RME', 'WHS'];

export default function Actions() {
  const { actions, audits, updateAction, createAction, deleteAction } = useAudits();
  const { selectedStation, stations } = useAuth();
  const [filter, setFilter] = useState('open');
  const [auditFilter, setAuditFilter] = useState('all');
  const [selectedAction, setSelectedAction] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionToDelete, setActionToDelete] = useState(null);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    priority: 'medium',
    location: '',
    owner: '',
  });

  // Get unique audits that have actions
  const auditsWithActions = useMemo(() => {
    const auditIds = [...new Set(actions.map(a => a.auditId).filter(Boolean))];
    return audits.filter(audit => auditIds.includes(audit.id));
  }, [actions, audits]);

  const filteredActions = useMemo(() => {
    return actions
      .filter(action => {
        // Filter by status
        if (filter !== 'all' && action.status !== filter) return false;
        // Filter by audit
        if (auditFilter !== 'all') {
          if (auditFilter === 'manual') {
            // Show only manual actions (no auditId)
            if (action.auditId) return false;
          } else {
            // Show actions from specific audit
            if (action.auditId !== auditFilter) return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        // Sort by priority first, then by date
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [actions, filter, auditFilter]);

  const counts = useMemo(() => ({
    all: actions.length,
    open: actions.filter(a => a.status === 'open').length,
    in_progress: actions.filter(a => a.status === 'in_progress').length,
    completed: actions.filter(a => a.status === 'completed').length,
  }), [actions]);

  const tabs = [
    { value: 'open', label: `Open (${counts.open})` },
    { value: 'in_progress', label: `In Progress (${counts.in_progress})` },
    { value: 'completed', label: `Completed (${counts.completed})` },
    { value: 'all', label: `All (${counts.all})` },
  ];

  const getPriorityConfig = (priority) => {
    const configs = {
      high: { label: 'High', variant: 'danger', icon: AlertTriangle },
      medium: { label: 'Medium', variant: 'warning', icon: Clock },
      low: { label: 'Low', variant: 'info', icon: CheckCircle },
    };
    return configs[priority] || configs.medium;
  };

  const handleStatusChange = async (actionId, newStatus) => {
    try {
      await updateAction(actionId, { status: newStatus });
      toast.success(`Action marked as ${newStatus.replace('_', ' ')}`);
      setSelectedAction(null);
    } catch (error) {
      toast.error('Failed to update action');
    }
  };

  const handleExportPDF = () => {
    try {
      const filename = generateActionsPDF(actions);
      toast.success(`Exported ${filename}`);
    } catch (error) {
      toast.error('Failed to export actions');
    }
  };

  const handleCreateAction = async () => {
    if (!newAction.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      await createAction({
        title: newAction.title,
        questionText: newAction.title,
        description: newAction.description,
        notes: newAction.description,
        priority: newAction.priority,
        location: newAction.location || selectedStation,
        owner: newAction.owner || null,
      });
      toast.success('Action created successfully');
      setShowCreateModal(false);
      setNewAction({ title: '', description: '', priority: 'medium', location: '', owner: '' });
    } catch (error) {
      toast.error('Failed to create action');
    }
  };

  const handleDeleteAction = async () => {
    if (!actionToDelete) return;

    try {
      await deleteAction(actionToDelete.id);
      toast.success('Action deleted successfully');
      setShowDeleteModal(false);
      setActionToDelete(null);
      setSelectedAction(null);
    } catch (error) {
      toast.error('Failed to delete action');
    }
  };

  const handleOwnerChange = async (actionId, owner) => {
    try {
      await updateAction(actionId, { owner: owner || null });
      toast.success('Owner updated successfully');
    } catch (error) {
      toast.error('Failed to update owner');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
            Actions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track and manage corrective actions from audits
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExportPDF}
            disabled={actions.length === 0}
          >
            Export PDF
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Create Action
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-red-500">{counts.open}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Open</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-amber-500">{counts.in_progress}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">In Progress</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-emerald-500">{counts.completed}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Completed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-slate-900 dark:text-white">{counts.all}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`
              flex-1 min-w-max px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap
              ${filter === tab.value
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Audit Filter */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Filter size={16} />
          <span>Filter by Audit:</span>
        </div>
        <select
          value={auditFilter}
          onChange={(e) => setAuditFilter(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border-none text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-amazon-orange/50 outline-none"
        >
          <option value="all">All Actions</option>
          <option value="manual">Manual Actions Only</option>
          {auditsWithActions.map(audit => (
            <option key={audit.id} value={audit.id}>
              [{audit.shortId || audit.id.slice(-8).toUpperCase()}] {audit.templateTitle} - {format(new Date(audit.date), 'MMM d, yyyy')}
            </option>
          ))}
        </select>
        {auditFilter !== 'all' && (
          <button
            onClick={() => setAuditFilter('all')}
            className="text-sm text-amazon-orange hover:text-amazon-orange/80 transition-colors"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Actions List */}
      {filteredActions.length > 0 ? (
        <div className="space-y-3">
          {filteredActions.map((action, index) => {
            const priorityConfig = getPriorityConfig(action.priority);
            const PriorityIcon = priorityConfig.icon;

            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="p-4 cursor-pointer hover:border-amazon-orange/50 transition-all"
                  onClick={() => setSelectedAction(action)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${
                      action.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                      action.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <PriorityIcon size={20} className={
                        action.priority === 'high' ? 'text-red-500' :
                        action.priority === 'medium' ? 'text-amber-500' :
                        'text-blue-500'
                      } />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {action.questionText}
                        </h3>
                        <Badge variant={priorityConfig.variant} size="sm">
                          {priorityConfig.label}
                        </Badge>
                      </div>

                      {action.notes && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                          {action.notes}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                        {action.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {action.location}
                          </span>
                        )}
                        {action.owner && (
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            {action.owner}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {format(new Date(action.createdAt), 'MMM d, yyyy')}
                        </span>
                        {action.dueDate && (
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            Due {format(new Date(action.dueDate), 'MMM d')}
                          </span>
                        )}
                        {action.auditId && (
                          <span className="flex items-center gap-1 text-amazon-teal font-medium">
                            <Hash size={14} />
                            {action.auditShortId || audits.find(a => a.id === action.auditId)?.shortId || action.auditId.slice(-8).toUpperCase()}
                          </span>
                        )}
                        {action.auditId && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <ClipboardList size={14} />
                            {audits.find(a => a.id === action.auditId)?.templateTitle || 'Audit'}
                          </span>
                        )}
                        {!action.auditId && (
                          <span className="flex items-center gap-1 text-purple-500">
                            <Plus size={14} />
                            Manual
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={20} className="text-slate-400" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CheckCircle size={64} className="text-emerald-500 mx-auto mb-4" />
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
            No actions found
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            {filter === 'open'
              ? "Great job! No open actions to address."
              : "No actions match your current filter."
            }
          </p>
        </Card>
      )}

      {/* Action Detail Modal */}
      <Modal
        isOpen={!!selectedAction}
        onClose={() => setSelectedAction(null)}
        title="Action Details"
        size="md"
      >
        {selectedAction && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Issue</label>
              <p className="text-slate-900 dark:text-white font-medium mt-1">
                {selectedAction.questionText}
              </p>
            </div>

            {selectedAction.notes && (
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Notes</label>
                <p className="text-slate-700 dark:text-slate-300 mt-1">
                  {selectedAction.notes}
                </p>
              </div>
            )}

            {/* Audit ID display */}
            {selectedAction.auditId && (
              <div className="p-3 bg-amazon-teal/10 border border-amazon-teal/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-amazon-teal" />
                  <label className="text-sm font-medium text-amazon-teal">Audit ID</label>
                </div>
                <p className="text-lg font-bold text-amazon-teal mt-1">
                  {selectedAction.auditShortId || audits.find(a => a.id === selectedAction.auditId)?.shortId || selectedAction.auditId.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {audits.find(a => a.id === selectedAction.auditId)?.templateTitle || 'Audit'}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Priority</label>
                <Badge variant={getPriorityConfig(selectedAction.priority).variant} className="mt-1">
                  {getPriorityConfig(selectedAction.priority).label}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Location</label>
                <p className="text-slate-900 dark:text-white mt-1">
                  {selectedAction.location || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2 block">Owner</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleOwnerChange(selectedAction.id, null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    !selectedAction.owner
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  None
                </button>
                {OWNER_OPTIONS.map((owner) => (
                  <button
                    key={owner}
                    onClick={() => handleOwnerChange(selectedAction.id, owner)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedAction.owner === owner
                        ? 'bg-amazon-orange text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {owner}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Created</label>
                <p className="text-slate-900 dark:text-white mt-1">
                  {format(new Date(selectedAction.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              {selectedAction.dueDate && (
                <div>
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Due Date</label>
                  <p className="text-slate-900 dark:text-white mt-1">
                    {format(new Date(selectedAction.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3 block">
                Update Status
              </label>
              <div className="flex gap-2">
                {selectedAction.status !== 'in_progress' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStatusChange(selectedAction.id, 'in_progress')}
                    className="flex-1"
                  >
                    In Progress
                  </Button>
                )}
                {selectedAction.status !== 'completed' && (
                  <Button
                    variant="success"
                    size="sm"
                    icon={CheckCircle}
                    onClick={() => handleStatusChange(selectedAction.id, 'completed')}
                    className="flex-1"
                  >
                    Complete
                  </Button>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <Button
                variant="danger"
                size="sm"
                icon={Trash2}
                onClick={() => {
                  setActionToDelete(selectedAction);
                  setShowDeleteModal(true);
                }}
                className="w-full"
              >
                Delete Action
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Action Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewAction({ title: '', description: '', priority: 'medium', location: '' });
        }}
        title="Create New Action"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Title *
            </label>
            <input
              type="text"
              value={newAction.title}
              onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter action title..."
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Description
            </label>
            <textarea
              value={newAction.description}
              onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what needs to be done..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-none resize-none focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Priority
            </label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map((priority) => (
                <button
                  key={priority}
                  onClick={() => setNewAction(prev => ({ ...prev, priority }))}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${
                    newAction.priority === priority
                      ? priority === 'high'
                        ? 'bg-red-500 text-white'
                        : priority === 'medium'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Location
            </label>
            <select
              value={newAction.location}
              onChange={(e) => setNewAction(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white outline-none"
            >
              <option value="">Select location...</option>
              {stations?.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name} - {station.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Owner
            </label>
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setNewAction(prev => ({ ...prev, owner: '' }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !newAction.owner
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                None
              </button>
              {OWNER_OPTIONS.map((owner) => (
                <button
                  key={owner}
                  type="button"
                  onClick={() => setNewAction(prev => ({ ...prev, owner }))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    newAction.owner === owner
                      ? 'bg-amazon-orange text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {owner}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewAction({ title: '', description: '', priority: 'medium', location: '', owner: '' });
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={handleCreateAction}
              className="flex-1"
            >
              Create Action
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setActionToDelete(null);
        }}
        title="Delete Action"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Are you sure you want to delete this action?
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                "{actionToDelete?.questionText || actionToDelete?.title}" will be permanently removed.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setActionToDelete(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={handleDeleteAction}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
