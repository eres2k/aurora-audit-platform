import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  FileText,
  Clock,
  Play,
  Download,
  Upload,
} from 'lucide-react';
import { useAudits } from '../context/AuditContext';
import { Button, Card, Input, Modal } from '../components/ui';

export default function Templates() {
  const navigate = useNavigate();
  const { templates } = useAudits();
  const [search, setSearch] = useState('');
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredTemplates = templates.filter(template =>
    template.title?.toLowerCase().includes(search.toLowerCase()) ||
    template.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templates, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "audit_templates.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getCategoryColor = (category) => {
    const colors = {
      Safety: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      Compliance: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      Quality: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      Operations: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return colors[category] || 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">
            Templates
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your audit inspection templates
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={Download}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowExportModal(true)}
          >
            New Template
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          icon={Search}
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-5 h-full flex flex-col">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${template.color}20` }}
                >
                  <FileText size={28} style={{ color: template.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {template.title}
                  </h3>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex-1">
                {template.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  ~{template.estimatedTime} min
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={16} />
                  {template.sections?.length} sections
                </span>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => {}}
                >
                  View Details
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Play}
                  className="flex-1"
                  onClick={() => navigate(`/audits/new?template=${template.id}`)}
                >
                  Start Audit
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card className="text-center py-16">
          <FileText size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {search ? "No templates match your search." : "Create your first template to get started."}
          </p>
        </Card>
      )}

      {/* New Template Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Create New Template"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-slate-500 dark:text-slate-400">
            Template creation is coming soon. For now, you can import templates using JSON format.
          </p>
          <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4">
            <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
              Import custom templates by modifying the template JSON and reloading the app.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowExportModal(false)}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
