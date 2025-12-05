import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Trash2,
  Sparkles,
  Wand2,
  Image,
  Loader2,
  Eye,
  RefreshCw,
  Camera,
  Edit3,
  ChevronDown,
  ChevronUp,
  GripVertical,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAudits } from '../context/AuditContext';
import { useLanguage } from '../context/LanguageContext';
import { Button, Card, Input, Modal } from '../components/ui';
import { aiApi } from '../utils/api';
import { v4 as uuidv4 } from 'uuid';

export default function Templates() {
  const navigate = useNavigate();
  const { templates, createTemplate, deleteTemplate, updateTemplate } = useAudits();
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const fileInputRef = useRef(null);

  // Edit template state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  // AI Template Generation state
  const [aiMode, setAiMode] = useState('text'); // 'text' or 'image'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCategory, setAiCategory] = useState('Safety');
  const [aiImageBase64, setAiImageBase64] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const aiImageInputRef = useRef(null);

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate(templateToDelete.id);
      toast.success('Template deleted successfully');
      setShowDeleteModal(false);
      setTemplateToDelete(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete template');
    }
  };

  // Handle AI image upload
  const handleAiImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10MB');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setAiImageBase64(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Generate template from AI
  const handleAiGenerate = async () => {
    if (aiMode === 'text' && !aiPrompt.trim()) {
      toast.error('Please describe the audit template you want to create');
      return;
    }
    if (aiMode === 'image' && !aiImageBase64) {
      toast.error('Please upload an image of a paper form');
      return;
    }

    setIsGenerating(true);
    setGeneratedTemplate(null);

    try {
      let response;
      if (aiMode === 'text') {
        response = await aiApi.generateTemplate(aiPrompt, aiCategory);
      } else {
        response = await aiApi.imageToTemplate(aiImageBase64);
      }

      if (response.success && response.data) {
        setGeneratedTemplate(response.data);
        setShowPreviewModal(true);
        toast.success('Template generated! Review and save it.');
      } else {
        throw new Error(response.error || 'Failed to generate template');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error(error.message || 'Failed to generate template');
    } finally {
      setIsGenerating(false);
    }
  };

  // Save the generated template
  const handleSaveGeneratedTemplate = async () => {
    if (!generatedTemplate) return;

    try {
      await createTemplate({
        ...generatedTemplate,
        category: generatedTemplate.category || aiCategory,
        color: generatedTemplate.color || '#FF9900',
        estimatedTime: generatedTemplate.estimatedTime || 15,
        isDefault: false,
      });
      toast.success('Template saved successfully!');
      setShowPreviewModal(false);
      setShowNewTemplateModal(false);
      setGeneratedTemplate(null);
      setAiPrompt('');
      setAiImageBase64(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save template');
    }
  };

  // Reset AI generation state
  const resetAiGeneration = () => {
    setAiPrompt('');
    setAiImageBase64(null);
    setGeneratedTemplate(null);
    setAiMode('text');
    setAiCategory('Safety');
    if (aiImageInputRef.current) {
      aiImageInputRef.current.value = '';
    }
  };

  // Open edit modal with template data
  const handleEditTemplate = (template) => {
    // Deep clone the template to avoid mutating the original
    setEditingTemplate(JSON.parse(JSON.stringify(template)));
    // Expand all sections by default
    const expanded = {};
    template.sections?.forEach(section => {
      expanded[section.id] = true;
    });
    setExpandedSections(expanded);
    setShowEditModal(true);
  };

  // Save edited template
  const handleSaveEditedTemplate = async () => {
    if (!editingTemplate) return;

    // Validate
    if (!editingTemplate.title?.trim()) {
      toast.error(t('templateName') + ' is required');
      return;
    }
    if (!editingTemplate.sections?.length) {
      toast.error('At least one section is required');
      return;
    }

    try {
      await updateTemplate(editingTemplate.id, editingTemplate);
      toast.success('Template updated successfully');
      setShowEditModal(false);
      setEditingTemplate(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update template');
    }
  };

  // Update editing template field
  const updateEditingField = (field, value) => {
    setEditingTemplate(prev => ({ ...prev, [field]: value }));
  };

  // Update section in editing template
  const updateSection = (sectionId, field, value) => {
    setEditingTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, [field]: value } : s
      ),
    }));
  };

  // Add new section
  const addSection = () => {
    const newSection = {
      id: `sec-${uuidv4().slice(0, 8)}`,
      title: 'New Section',
      items: [],
    };
    setEditingTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setExpandedSections(prev => ({ ...prev, [newSection.id]: true }));
  };

  // Delete section
  const deleteSection = (sectionId) => {
    setEditingTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
    }));
  };

  // Update question in editing template
  const updateQuestion = (sectionId, questionId, field, value) => {
    setEditingTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? {
              ...s,
              items: s.items.map(q =>
                q.id === questionId ? { ...q, [field]: value } : q
              ),
            }
          : s
      ),
    }));
  };

  // Add new question to section
  const addQuestion = (sectionId) => {
    const newQuestion = {
      id: `q-${uuidv4().slice(0, 8)}`,
      text: 'New Question',
      type: 'bool',
      required: false,
      critical: false,
    };
    setEditingTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, items: [...s.items, newQuestion] }
          : s
      ),
    }));
  };

  // Delete question from section
  const deleteQuestion = (sectionId, questionId) => {
    setEditingTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId
          ? { ...s, items: s.items.filter(q => q.id !== questionId) }
          : s
      ),
    }));
  };

  // Toggle section expand/collapse
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

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
                  onClick={(e) => {
                    e.stopPropagation();
                    setTemplateToDelete(template);
                    setShowDeleteModal(true);
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditTemplate(template);
                  }}
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Edit3 size={16} />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Play}
                  className="flex-1"
                  onClick={() => navigate(`/audits/new?template=${template.id}`)}
                >
                  {t('startAudit')}
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

      {/* New Template Modal - AI Powered */}
      <Modal
        isOpen={showNewTemplateModal}
        onClose={() => {
          setShowNewTemplateModal(false);
          resetAiGeneration();
        }}
        title="Create New Template"
        size="lg"
      >
        <div className="space-y-5">
          {/* Smart Generation Badge */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Smart Generation</p>
              <p className="text-xs text-purple-600 dark:text-purple-400">Describe your audit or upload a paper form</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setAiMode('text')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                aiMode === 'text'
                  ? 'bg-amazon-orange text-white shadow-lg shadow-amazon-orange/30'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Wand2 size={18} />
              Text to Template
            </button>
            <button
              onClick={() => setAiMode('image')}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                aiMode === 'image'
                  ? 'bg-amazon-orange text-white shadow-lg shadow-amazon-orange/30'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Image size={18} />
              Image to Template
            </button>
          </div>

          {/* Text Mode */}
          {aiMode === 'text' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Describe your audit template
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Create a 5S audit for a delivery station loading dock with sections for Sort, Set in Order, Shine, Standardize, and Sustain..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-none resize-none focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Category
                </label>
                <div className="flex gap-2">
                  {['Safety', 'Quality', 'Compliance', 'Operations'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setAiCategory(cat)}
                      className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        aiCategory === cat
                          ? 'bg-amazon-orange text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Example prompts */}
              <div className="text-xs text-slate-500 dark:text-slate-400">
                <p className="font-medium mb-1">Example prompts:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li className="cursor-pointer hover:text-amazon-orange" onClick={() => setAiPrompt('Create a fire safety audit for a warehouse with sections for fire extinguishers, emergency exits, electrical safety, and hazardous materials storage.')}>Fire safety audit for warehouse</li>
                  <li className="cursor-pointer hover:text-amazon-orange" onClick={() => setAiPrompt('Create a PPE compliance audit for delivery drivers checking safety vests, proper footwear, and vehicle safety equipment.')}>PPE compliance for delivery drivers</li>
                  <li className="cursor-pointer hover:text-amazon-orange" onClick={() => setAiPrompt('Create a 5S workplace organization audit for an indoor sorting area including Sort, Set in Order, Shine, Standardize, and Sustain.')}>5S audit for sorting area</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Image Mode */}
          {aiMode === 'image' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <input
                type="file"
                ref={aiImageInputRef}
                onChange={handleAiImageUpload}
                accept="image/*"
                className="hidden"
              />

              {!aiImageBase64 ? (
                <button
                  onClick={() => aiImageInputRef.current?.click()}
                  className="w-full py-12 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-amazon-orange hover:bg-amazon-orange/5 transition-all flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <Camera size={32} className="text-slate-400" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-slate-700 dark:text-slate-300">Upload paper form image</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">JPG, PNG, or PDF - Max 10MB</p>
                  </div>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img
                      src={aiImageBase64}
                      alt="Uploaded form"
                      className="w-full max-h-64 object-contain"
                    />
                    <button
                      onClick={() => {
                        setAiImageBase64(null);
                        if (aiImageInputRef.current) aiImageInputRef.current.value = '';
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle size={16} />
                    Image uploaded - Ready to extract template
                  </p>
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload a photo of a paper checklist, audit form, or inspection sheet. The structure and questions will be extracted automatically.
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              icon={Upload}
              onClick={() => {
                setShowNewTemplateModal(false);
                resetAiGeneration();
                fileInputRef.current?.click();
              }}
              className="flex-1"
            >
              Import JSON
            </Button>
            <Button
              variant="primary"
              icon={isGenerating ? Loader2 : Sparkles}
              onClick={handleAiGenerate}
              disabled={isGenerating || (aiMode === 'text' && !aiPrompt.trim()) || (aiMode === 'image' && !aiImageBase64)}
              className={`flex-1 ${isGenerating ? '' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'}`}
            >
              {isGenerating ? 'Generating...' : 'Generate Template'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Template Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setGeneratedTemplate(null);
        }}
        title="Generated Template Preview"
        size="lg"
      >
        {generatedTemplate && (
          <div className="space-y-4">
            {/* Template Header */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amazon-orange/10 to-amazon-teal/10 border border-amazon-orange/20">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {generatedTemplate.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {generatedTemplate.description}
              </p>
              <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                <span className={`px-2 py-1 rounded-full ${getCategoryColor(generatedTemplate.category)}`}>
                  {generatedTemplate.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  ~{generatedTemplate.estimatedTime} min
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={12} />
                  {generatedTemplate.sections?.length} sections
                </span>
              </div>
            </div>

            {/* Sections Preview */}
            <div className="max-h-80 overflow-y-auto space-y-3">
              {generatedTemplate.sections?.map((section, idx) => (
                <div key={section.id || idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {idx + 1}. {section.title}
                  </h4>
                  <ul className="space-y-1">
                    {section.items?.map((item, iIdx) => (
                      <li key={item.id || iIdx} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <span className="text-amazon-orange">-</span>
                        <span>
                          {item.text}
                          {item.critical && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
                              Critical
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="secondary"
                icon={RefreshCw}
                onClick={() => {
                  setShowPreviewModal(false);
                  handleAiGenerate();
                }}
                disabled={isGenerating}
                className="flex-1"
              >
                Regenerate
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle}
                onClick={handleSaveGeneratedTemplate}
                className="flex-1"
              >
                Save Template
              </Button>
            </div>
          </div>
        )}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setTemplateToDelete(null);
        }}
        title={t('deleteTemplate')}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="text-red-500 flex-shrink-0" size={24} />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                {t('deleteTemplateConfirm')}
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                "{templateToDelete?.title}" {t('templateWillBeRemoved')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setTemplateToDelete(null);
              }}
              className="flex-1"
            >
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              icon={Trash2}
              onClick={handleDeleteTemplate}
              className="flex-1"
            >
              {t('delete')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTemplate(null);
        }}
        title={t('editTemplate')}
        size="xl"
      >
        {editingTemplate && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  {t('templateName')} *
                </label>
                <input
                  type="text"
                  value={editingTemplate.title || ''}
                  onChange={(e) => updateEditingField('title', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                  placeholder="Template name..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  {t('description')}
                </label>
                <textarea
                  value={editingTemplate.description || ''}
                  onChange={(e) => updateEditingField('description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-none resize-none focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
                  placeholder="Template description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    {t('category')}
                  </label>
                  <select
                    value={editingTemplate.category || 'Safety'}
                    onChange={(e) => updateEditingField('category', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Safety">Safety</option>
                    <option value="Quality">Quality</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    {t('estimatedTime')} ({t('min')})
                  </label>
                  <input
                    type="number"
                    value={editingTemplate.estimatedTime || 15}
                    onChange={(e) => updateEditingField('estimatedTime', parseInt(e.target.value) || 15)}
                    min={1}
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 border-none focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Sections */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {t('sections')} ({editingTemplate.sections?.length || 0})
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={addSection}
                >
                  {t('addSection')}
                </Button>
              </div>

              <div className="space-y-3">
                {editingTemplate.sections?.map((section, sectionIndex) => (
                  <div
                    key={section.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                  >
                    {/* Section Header */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800 cursor-pointer"
                      onClick={() => toggleSection(section.id)}
                    >
                      <GripVertical size={16} className="text-slate-400" />
                      <input
                        type="text"
                        value={section.title || ''}
                        onChange={(e) => {
                          e.stopPropagation();
                          updateSection(section.id, 'title', e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-transparent border-none font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-0"
                        placeholder="Section title..."
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {section.items?.length || 0} {t('questions').toLowerCase()}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(section.id);
                        }}
                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <X size={16} />
                      </button>
                      {expandedSections[section.id] ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                    </div>

                    {/* Section Content */}
                    <AnimatePresence>
                      {expandedSections[section.id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-4 py-3 space-y-2"
                        >
                          {section.items?.map((question, questionIndex) => (
                            <div
                              key={question.id}
                              className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700"
                            >
                              <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500 flex-shrink-0 mt-1">
                                {questionIndex + 1}
                              </span>
                              <div className="flex-1 space-y-2">
                                <textarea
                                  value={question.text || ''}
                                  onChange={(e) => updateQuestion(section.id, question.id, 'text', e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amazon-orange/50 text-slate-900 dark:text-white outline-none resize-none"
                                  placeholder="Question text..."
                                />
                                <div className="flex items-center gap-4 flex-wrap">
                                  <select
                                    value={question.type || 'bool'}
                                    onChange={(e) => updateQuestion(section.id, question.id, 'type', e.target.value)}
                                    className="px-2 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                  >
                                    <option value="bool">Yes/No</option>
                                    <option value="rating">Rating (1-5)</option>
                                    <option value="text">Text</option>
                                    <option value="photo">Photo</option>
                                  </select>
                                  <label className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                    <input
                                      type="checkbox"
                                      checked={question.required || false}
                                      onChange={(e) => updateQuestion(section.id, question.id, 'required', e.target.checked)}
                                      className="rounded border-slate-300 text-amazon-orange focus:ring-amazon-orange"
                                    />
                                    {t('required')}
                                  </label>
                                  <label className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                                    <input
                                      type="checkbox"
                                      checked={question.critical || false}
                                      onChange={(e) => updateQuestion(section.id, question.id, 'critical', e.target.checked)}
                                      className="rounded border-slate-300 text-red-500 focus:ring-red-500"
                                    />
                                    {t('critical')}
                                  </label>
                                </div>
                              </div>
                              <button
                                onClick={() => deleteQuestion(section.id, question.id)}
                                className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded flex-shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}

                          {/* Add Question Button */}
                          <button
                            onClick={() => addQuestion(section.id)}
                            className="w-full py-2 px-4 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-amazon-orange hover:text-amazon-orange transition-colors flex items-center justify-center gap-2 text-sm"
                          >
                            <Plus size={16} />
                            {t('addQuestion')}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTemplate(null);
                }}
                className="flex-1"
              >
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle}
                onClick={handleSaveEditedTemplate}
                className="flex-1"
              >
                {t('saveChanges')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
