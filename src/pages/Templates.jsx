import React, { useState, useRef } from 'react';
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
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAudits } from '../context/AuditContext';
import { Button, Card, Input, Modal } from '../components/ui';

export default function Templates() {
  const navigate = useNavigate();
  const { templates, createTemplate } = useAudits();
  const [search, setSearch] = useState('');
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const filteredTemplates = templates.filter(template =>
    template.title?.toLowerCase().includes(search.toLowerCase()) ||
    template.description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = (exportAll = true) => {
    const dataToExport = exportAll ? templates : templates.filter(t => !t.id.startsWith('tpl-'));
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      templates: dataToExport,
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    const filename = `audit_templates_${new Date().toISOString().split('T')[0]}.json`;
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success(`Exported ${dataToExport.length} templates`);
  };

  const validateTemplate = (template) => {
    const errors = [];
    if (!template.title || typeof template.title !== 'string') {
      errors.push('Missing or invalid title');
    }
    if (!template.sections || !Array.isArray(template.sections)) {
      errors.push('Missing or invalid sections');
    } else {
      template.sections.forEach((section, sIdx) => {
        if (!section.title) {
          errors.push(`Section ${sIdx + 1}: Missing title`);
        }
        if (!section.items || !Array.isArray(section.items)) {
          errors.push(`Section ${sIdx + 1}: Missing or invalid items`);
        } else {
          section.items.forEach((item, iIdx) => {
            if (!item.text) {
              errors.push(`Section ${sIdx + 1}, Item ${iIdx + 1}: Missing question text`);
            }
            if (!item.type || !['bool', 'rating', 'options', 'text', 'photo'].includes(item.type)) {
              errors.push(`Section ${sIdx + 1}, Item ${iIdx + 1}: Invalid question type`);
            }
          });
        }
      });
    }
    return errors;
  };

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Handle both old format (array) and new format (object with templates array)
      const templatesToImport = Array.isArray(data) ? data : (data.templates || []);

      if (!Array.isArray(templatesToImport) || templatesToImport.length === 0) {
        toast.error('No valid templates found in file');
        return;
      }

      const results = {
        total: templatesToImport.length,
        imported: 0,
        skipped: 0,
        errors: [],
      };

      for (const template of templatesToImport) {
        const validationErrors = validateTemplate(template);

        if (validationErrors.length > 0) {
          results.errors.push({
            template: template.title || 'Unknown',
            errors: validationErrors,
          });
          results.skipped++;
          continue;
        }

        // Check for duplicates
        const exists = templates.some(t => t.id === template.id);
        if (exists) {
          results.errors.push({
            template: template.title,
            errors: ['Template with same ID already exists'],
          });
          results.skipped++;
          continue;
        }

        // Create the template without the original ID to generate a new one
        const { id, ...templateData } = template;
        await createTemplate({
          ...templateData,
          category: templateData.category || 'Operations',
          color: templateData.color || '#6366F1',
          estimatedTime: templateData.estimatedTime || 15,
        });
        results.imported++;
      }

      setImportResult(results);
      setShowImportModal(true);

      if (results.imported > 0) {
        toast.success(`Imported ${results.imported} template(s)`);
      }
    } catch (error) {
      toast.error('Failed to parse file. Please ensure it is valid JSON.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
          <Button
            variant="secondary"
            icon={Upload}
            onClick={() => fileInputRef.current?.click()}
          >
            Import
          </Button>
          <Button
            variant="secondary"
            icon={Download}
            onClick={() => handleExport(true)}
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowNewTemplateModal(true)}
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
        isOpen={showNewTemplateModal}
        onClose={() => setShowNewTemplateModal(false)}
        title="Create New Template"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-slate-500 dark:text-slate-400">
            Template creation is coming soon. For now, you can import templates using JSON format.
          </p>
          <div className="bg-slate-100 dark:bg-slate-900 rounded-xl p-4">
            <p className="text-sm font-mono text-slate-600 dark:text-slate-400 mb-3">
              Example template structure:
            </p>
            <pre className="text-xs text-slate-600 dark:text-slate-400 overflow-x-auto">
{`{
  "title": "My Custom Audit",
  "description": "Description here",
  "category": "Safety",
  "color": "#FF9900",
  "estimatedTime": 15,
  "sections": [{
    "id": "sec-1",
    "title": "Section Name",
    "items": [{
      "id": "q1",
      "text": "Question text?",
      "type": "bool",
      "required": true
    }]
  }]
}`}
            </pre>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={Upload}
              onClick={() => {
                setShowNewTemplateModal(false);
                fileInputRef.current?.click();
              }}
              className="flex-1"
            >
              Import JSON
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowNewTemplateModal(false)}
              className="flex-1"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import Results Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportResult(null);
        }}
        title="Import Results"
        size="lg"
      >
        {importResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {importResult.total}
                </p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-center">
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {importResult.imported}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Imported</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {importResult.skipped}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">Skipped</p>
              </div>
            </div>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-500" />
                  Issues Found
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {importResult.errors.map((err, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <p className="font-medium text-sm text-amber-800 dark:text-amber-200">
                        {err.template}
                      </p>
                      <ul className="mt-1 text-xs text-amber-700 dark:text-amber-300 list-disc list-inside">
                        {err.errors.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success message */}
            {importResult.imported > 0 && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
                <CheckCircle className="text-emerald-500" size={20} />
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  Successfully imported {importResult.imported} template(s)!
                </p>
              </div>
            )}

            <Button
              variant="primary"
              onClick={() => {
                setShowImportModal(false);
                setImportResult(null);
              }}
              className="w-full"
            >
              Done
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
