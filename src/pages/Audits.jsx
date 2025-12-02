import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  ClipboardList,
  Grid,
  List,
  Download,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAudits } from '../context/AuditContext';
import { Button, Card, Input } from '../components/ui';
import { AuditCard } from '../components/audit';
import { generateAuditPDF } from '../utils/pdfExport';

export default function Audits() {
  const navigate = useNavigate();
  const { audits, templates, loading } = useAudits();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const handleExportAllPDFs = async () => {
    const completedAudits = filteredAudits.filter(a => a.status === 'completed');
    if (completedAudits.length === 0) {
      toast.error('No completed audits to export');
      return;
    }

    toast.loading(`Exporting ${completedAudits.length} audit(s)...`, { id: 'export' });

    let exported = 0;
    for (const audit of completedAudits) {
      try {
        const template = templates.find(t => t.id === audit.templateId);
        generateAuditPDF(audit, template);
        exported++;
        // Small delay between downloads to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to export audit ${audit.id}:`, error);
      }
    }

    toast.success(`Exported ${exported} PDF(s)`, { id: 'export' });
  };

  const filteredAudits = useMemo(() => {
    return audits
      .filter(audit => {
        if (filter !== 'all' && audit.status !== filter) return false;
        if (search && !audit.templateTitle?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [audits, filter, search]);

  const counts = useMemo(() => ({
    all: audits.length,
    draft: audits.filter(a => a.status === 'draft').length,
    in_progress: audits.filter(a => a.status === 'in_progress').length,
    completed: audits.filter(a => a.status === 'completed').length,
  }), [audits]);

  const tabs = [
    { value: 'all', label: `All (${counts.all})` },
    { value: 'draft', label: `Drafts (${counts.draft})` },
    { value: 'in_progress', label: `In Progress (${counts.in_progress})` },
    { value: 'completed', label: `Completed (${counts.completed})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
            Audits
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage and review all your safety audits
          </p>
        </div>
        <div className="flex gap-2">
          {counts.completed > 0 && (
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleExportAllPDFs}
            >
              Export PDFs
            </Button>
          )}
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/audits/new')}
          >
            New Audit
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            icon={Search}
            placeholder="Search audits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setViewMode('grid')}
            className="px-3"
          >
            <Grid size={20} />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="md"
            onClick={() => setViewMode('list')}
            className="px-3"
          >
            <List size={20} />
          </Button>
        </div>
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

      {/* Content */}
      <AnimatePresence mode="wait">
        {filteredAudits.length > 0 ? (
          <motion.div
            key="audits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={viewMode === 'grid'
              ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }
          >
            {filteredAudits.map((audit, index) => (
              <AuditCard key={audit.id} audit={audit} index={index} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="text-center py-16">
              <ClipboardList size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
                No audits found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                {search
                  ? "No audits match your search criteria. Try adjusting your filters."
                  : "You haven't created any audits yet. Get started by creating your first one."
                }
              </p>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => navigate('/audits/new')}
              >
                Create Your First Audit
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
