import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  MinusCircle,
  Download,
  Upload,
  BarChart3,
  AlertTriangle,
  ArrowLeft,
  LayoutDashboard,
  ClipboardList,
  Sparkles,
  Loader2,
  Bot,
  X,
  LogOut,
  MapPin
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import StationSelector from './components/StationSelector';

// --- GEMINI API SETUP ---
// Nutzt Environment Variable für Sicherheit (Vite Standard)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";

const callGeminiAPI = async (prompt) => {
  if (!apiKey) {
    console.warn("Kein API Key gefunden. Bitte VITE_GEMINI_API_KEY in .env oder Netlify setzen.");
    return "API Key fehlt. Bitte Konfiguration prüfen.";
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) throw new Error('API request failed');
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Keine Antwort erhalten.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Entschuldigung, ich konnte den KI-Service momentan nicht erreichen. Bitte überprüfen Sie Ihre Verbindung.";
  }
};

// --- MOCK DATA & DEFAULT TEMPLATES ---
const DEFAULT_TEMPLATE = {
  id: "tmpl_001",
  title: "Standard WHS Daily Audit (Amazon Logistics)",
  description: "Tägliche Sicherheitsüberprüfung für Delivery Stations.",
  sections: [
    {
      id: "sec_ppe",
      title: "PSA & Verhalten",
      items: [
        { id: "q1", text: "Tragen alle Mitarbeiter Sicherheitsschuhe?", type: "bool" },
        { id: "q2", text: "Sind Warnwesten in den ausgewiesenen Bereichen sichtbar?", type: "bool" },
        { id: "q3", text: "Werden Lasten korrekt gehoben (Kraftzone)?", type: "bool" }
      ]
    },
    {
      id: "sec_5s",
      title: "5S & Housekeeping",
      items: [
        { id: "q4", text: "Sind die Laufwege frei von Hindernissen (Paletten, Müll)?", type: "bool" },
        { id: "q5", text: "Sind Feuerlöscher und Notausgänge frei zugänglich?", type: "bool" },
        { id: "q6", text: "Ist der Müll in den korrekten Behältern getrennt?", type: "bool" }
      ]
    },
    {
      id: "sec_hazards",
      title: "Gefahrenstellen",
      items: [
        { id: "q7", text: "Sind Förderbänder (Conveyors) frei von Beschädigungen?", type: "bool" },
        { id: "q8", text: "Sind beschädigte Regale markiert und gesperrt?", type: "bool" }
      ]
    }
  ]
};

// --- COMPONENTS ---

// 1. UI Components
const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled, loading }) => {
  const baseStyle = "flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900",
    secondary: "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-200",
    accent: "bg-amber-400 text-slate-900 hover:bg-amber-500 focus:ring-amber-400",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-200",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    ai: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : Icon && <Icon size={18} className="mr-2" />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    completed: "bg-green-100 text-green-800",
    draft: "bg-amber-100 text-amber-800",
    failed: "bg-red-100 text-red-800"
  };

  const labels = {
    completed: "Abgeschlossen",
    draft: "Entwurf",
    failed: "Durchgefallen"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
};

// --- AI REPORT MODAL ---
const AiReportModal = ({ audits, onClose }) => {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);

    // Prepare data for AI (simplify to save tokens)
    const auditSummary = audits.slice(0, 5).map(a => ({
      date: a.date,
      score: a.score,
      location: a.location,
      failures: Object.entries(a.answers).filter(([k, v]) => v === 'fail').length
    }));

    const prompt = `
      Du bist ein erfahrener WHS (Workplace Health & Safety) Manager bei Amazon Logistics.
      Analysiere die folgenden letzten 5 Audits und erstelle eine kurze, professionelle "Executive Summary" auf Deutsch.

      Daten: ${JSON.stringify(auditSummary)}

      Struktur der Antwort:
      1. **Gesamttrend**: (Steigend/Fallend)
      2. **Hauptrisiken**: (Interpretierte Risikobereiche basierend auf Failures)
      3. **Empfohlener Fokus**: (Worauf soll das Team nächste Woche achten)

      Halte es prägnant und motivierend. Nutze Formatierung.
    `;

    const result = await callGeminiAPI(prompt);
    setAnalysis(result);
    setLoading(false);
  };

  // Auto-start generation
  useEffect(() => {
    generateReport();
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">KI Sicherheits-Analyse</h3>
              <p className="text-xs text-slate-500">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 size={48} className="text-indigo-500 animate-spin" />
              <p className="text-slate-500 animate-pulse">Analysiere Audit-Daten...</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-line text-slate-800 text-sm leading-relaxed">
                {analysis}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
          <Button onClick={onClose} variant="secondary">Schließen</Button>
        </div>
      </Card>
    </div>
  );
};

// --- DASHBOARD ---
const Dashboard = ({ audits, onStartAudit }) => {
  const [showAiReport, setShowAiReport] = useState(false);

  const stats = useMemo(() => {
    const total = audits.length;
    const completed = audits.filter(a => a.status === 'completed').length;
    const avgScore = completed > 0
      ? Math.round(audits.filter(a => a.status === 'completed').reduce((acc, curr) => acc + curr.score, 0) / completed)
      : 0;

    return { total, completed, avgScore };
  }, [audits]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {showAiReport && <AiReportModal audits={audits} onClose={() => setShowAiReport(false)} />}

      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">Willkommen zurück, WHS Manager</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ai"
            icon={Sparkles}
            onClick={() => setShowAiReport(true)}
            disabled={audits.length === 0}
          >
            KI Analyse
          </Button>
          <Button variant="accent" icon={Plus} onClick={onStartAudit}>Neues Audit</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Compliance Score</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.avgScore}%</h3>
            </div>
            <div className={`p-2 rounded-lg ${stats.avgScore >= 90 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
              <BarChart3 size={24} />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${stats.avgScore >= 90 ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${stats.avgScore}%` }}
            ></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Audits Gesamt</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</h3>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">Alle Zeiträume</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Offene Aktionen</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">0</h3>
            </div>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <AlertTriangle size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">Aktuell keine Blocker</p>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Letzte Aktivitäten</h3>
        <div className="space-y-3">
          {audits.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500">Noch keine Audits durchgeführt.</p>
            </div>
          ) : (
            audits.slice(0, 5).map(audit => (
              <Card key={audit.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <FileText size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{audit.templateTitle}</h4>
                    <p className="text-xs text-slate-500">{new Date(audit.date).toLocaleDateString()} • {audit.location || 'Unbekannter Ort'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${audit.score >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                    {audit.score}%
                  </span>
                  <StatusBadge status={audit.status} />
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// --- AUDIT RECORDER ---
const AuditRecorder = ({ template, onSave, onCancel }) => {
  const { selectedStation } = useAuth();
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [globalNotes, setGlobalNotes] = useState("");

  // AI State
  const [aiLoading, setAiLoading] = useState(null); // ID of question being processed
  const [aiSuggestions, setAiSuggestions] = useState({}); // Store suggestions per question ID

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    // Clear AI suggestion if status changes to pass
    if (value === 'pass') {
        const newSuggestions = {...aiSuggestions};
        delete newSuggestions[questionId];
        setAiSuggestions(newSuggestions);
    }
  };

  const handleNoteChange = (questionId, text) => {
      setNotes(prev => ({...prev, [questionId]: text}));
  }

  const getAiSuggestion = async (questionId, questionText) => {
    setAiLoading(questionId);
    const prompt = `
      Kontext: WHS Audit in einem Logistikzentrum (Amazon).
      Problem: Die Sicherheitsfrage "${questionText}" wurde mit "FAIL" (Risiko) beantwortet.
      Aufgabe: Schlage 3 konkrete, sofortige Korrekturmaßnahmen (bullet points) auf Deutsch vor.
      Halte es kurz und handlungsorientiert.
    `;

    const suggestion = await callGeminiAPI(prompt);
    setAiSuggestions(prev => ({...prev, [questionId]: suggestion}));
    setAiLoading(null);
  };

  const applyAiSuggestion = (questionId) => {
      const suggestion = aiSuggestions[questionId];
      if (suggestion) {
          const currentNote = notes[questionId] || "";
          handleNoteChange(questionId, currentNote + (currentNote ? "\n\n" : "") + "🤖 KI Vorschlag:\n" + suggestion);
      }
  }

  const calculateScore = () => {
    const totalQuestions = Object.keys(answers).length;
    if (totalQuestions === 0) return 0;

    const passed = Object.values(answers).filter(v => v === 'pass').length;
    const na = Object.values(answers).filter(v => v === 'na').length;
    const scorable = totalQuestions - na;

    if (scorable === 0) return 100;
    return Math.round((passed / scorable) * 100);
  };

  const handleFinish = () => {
    const score = calculateScore();
    onSave({
      answers,
      itemNotes: notes,
      score,
      location: selectedStation,
      notes: globalNotes,
      status: 'completed',
      date: new Date().toISOString()
    });
  };

  const currentScore = calculateScore();

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur py-4 border-b border-slate-200 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel} className="mr-2">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{template.title}</h2>
            <p className="text-sm text-slate-500">Neues Audit</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Score</p>
            <p className={`text-2xl font-bold ${currentScore >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
              {currentScore}%
            </p>
          </div>
          <Button variant="primary" onClick={handleFinish}>Abschließen</Button>
        </div>
      </div>

      {/* Meta Info */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Station</label>
            <div className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md">
              <MapPin size={16} className="text-blue-600" />
              <span className="font-semibold text-slate-900">{selectedStation}</span>
            </div>
          </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Auditor Notizen</label>
            <input
              type="text"
              value={globalNotes}
              onChange={(e) => setGlobalNotes(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              placeholder="Generelle Beobachtungen..."
            />
          </div>
        </div>
      </Card>

      {/* Questions */}
      {template.sections.map(section => (
        <div key={section.id} className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 px-1">{section.title}</h3>
          {section.items.map(item => (
            <Card key={item.id} className="p-4 transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{item.text}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-slate-50 p-1 rounded-lg border border-slate-100">
                  <button
                    onClick={() => handleAnswer(item.id, 'pass')}
                    className={`p-2 rounded-md flex items-center gap-2 transition-all ${answers[item.id] === 'pass' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                  >
                    <CheckCircle size={20} />
                    <span className="text-xs font-bold uppercase hidden sm:inline">Safe</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(item.id, 'fail')}
                    className={`p-2 rounded-md flex items-center gap-2 transition-all ${answers[item.id] === 'fail' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                  >
                    <XCircle size={20} />
                    <span className="text-xs font-bold uppercase hidden sm:inline">Risk</span>
                  </button>
                  <button
                    onClick={() => handleAnswer(item.id, 'na')}
                    className={`p-2 rounded-md flex items-center gap-2 transition-all ${answers[item.id] === 'na' ? 'bg-slate-500 text-white shadow-sm' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-200'}`}
                  >
                    <MinusCircle size={20} />
                    <span className="text-xs font-bold uppercase hidden sm:inline">N/A</span>
                  </button>
                </div>
              </div>

              {/* FAIL / RISK AREA */}
              {answers[item.id] === 'fail' && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-1 space-y-3">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-red-600 uppercase">Risiko erkannt</span>
                     {!aiSuggestions[item.id] && (
                        <Button
                            variant="ghost"
                            className="text-indigo-600 hover:bg-indigo-50 text-xs h-8 px-2"
                            icon={Sparkles}
                            loading={aiLoading === item.id}
                            onClick={() => getAiSuggestion(item.id, item.text)}
                        >
                            KI Maßnahmen vorschlagen
                        </Button>
                     )}
                  </div>

                  {aiSuggestions[item.id] && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm relative group">
                          <div className="flex gap-2">
                              <Bot className="text-indigo-600 shrink-0 mt-0.5" size={16} />
                              <div className="flex-1 text-indigo-900 whitespace-pre-line">
                                  {aiSuggestions[item.id]}
                              </div>
                          </div>
                          <button
                            onClick={() => applyAiSuggestion(item.id)}
                            className="mt-2 text-xs font-medium text-indigo-700 hover:text-indigo-900 underline"
                          >
                            In Notizen übernehmen
                          </button>
                      </div>
                  )}

                  <textarea
                    value={notes[item.id] || ""}
                    onChange={(e) => handleNoteChange(item.id, e.target.value)}
                    placeholder="Problem beschreiben & Foto-Link einfügen..."
                    className="w-full text-sm p-2 bg-red-50 border border-red-100 rounded-md text-red-800 placeholder:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-200"
                    rows={3}
                  />
                </div>
              )}
            </Card>
          ))}
        </div>
      ))}
      <div className="h-20"></div>
    </div>
  );
};

// --- TEMPLATE MANAGER ---
const TemplateManager = ({ templates, onUpdateTemplates }) => {
  const [jsonInput, setJsonInput] = useState("");
  const [mode, setMode] = useState('view'); // view, import

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templates, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "whs_templates.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("Format muss ein Array sein");
      onUpdateTemplates(parsed);
      setMode('view');
      setJsonInput("");
      alert("Vorlagen erfolgreich importiert!");
    } catch (e) {
      alert("Fehler beim Import: " + e.message);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Vorlagen Editor</h2>
          <p className="text-slate-500">Verwalte deine Inspektions-Fragen</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={Download} onClick={handleExport}>Export JSON</Button>
          <Button variant="primary" icon={Upload} onClick={() => setMode(mode === 'import' ? 'view' : 'import')}>
            {mode === 'import' ? 'Zurück zur Liste' : 'Import JSON'}
          </Button>
        </div>
      </div>

      {mode === 'import' ? (
        <Card className="p-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            JSON Paste Area (Netlify Blobs Kompatibel)
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-96 font-mono text-xs p-4 bg-slate-900 text-green-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder='[ { "id": "temp_1", "title": "...", "sections": [...] } ]'
          />
          <div className="mt-4 flex justify-end">
            <Button variant="primary" onClick={handleImport}>Vorlagen überschreiben</Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map(t => (
            <Card key={t.id} className="p-6 border-l-4 border-l-amber-400">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{t.title}</h3>
                  <p className="text-slate-500 text-sm mt-1">{t.description}</p>
                  <div className="mt-4 flex gap-2">
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {t.sections.length} Sektionen
                    </span>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                      {t.sections.reduce((acc, s) => acc + s.items.length, 0)} Fragen
                    </span>
                  </div>
                </div>
                <Button variant="ghost" icon={Settings}>Edit</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// --- MAIN APP SHELL ---
function AppContent() {
  const { user, selectedStation, logout, isAuthenticated, hasSelectedStation, loading } = useAuth();
  const [view, setView] = useState('dashboard'); // dashboard, audit, templates, reports
  const [activeTemplate, setActiveTemplate] = useState(null);

  // "Netlify Blobs" Simulation via LocalStorage
  const [templates, setTemplates] = useState([DEFAULT_TEMPLATE]);
  const [audits, setAudits] = useState([]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show station selector if authenticated but no station selected
  if (!hasSelectedStation) {
    return <StationSelector />;
  }

  useEffect(() => {
    const storedAudits = localStorage.getItem('safezone_audits');
    const storedTemplates = localStorage.getItem('safezone_templates');
    if (storedAudits) setAudits(JSON.parse(storedAudits));
    if (storedTemplates) setTemplates(JSON.parse(storedTemplates));
  }, []);

  const saveAudit = (auditData) => {
    const newAudit = {
      id: `aud_${Date.now()}`,
      templateId: activeTemplate.id,
      templateTitle: activeTemplate.title,
      ...auditData
    };

    const updatedAudits = [newAudit, ...audits];
    setAudits(updatedAudits);
    localStorage.setItem('safezone_audits', JSON.stringify(updatedAudits));
    setView('dashboard');
    setActiveTemplate(null);
  };

  const updateTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem('safezone_templates', JSON.stringify(newTemplates));
  };

  const startAudit = (template = templates[0]) => {
    setActiveTemplate(template);
    setView('run_audit');
  };

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'templates', label: 'Vorlagen', icon: ClipboardList },
    { id: 'reports', label: 'Berichte', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck size={32} />
            <span className="text-xl font-bold tracking-tight">SafeZone</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 ml-10">WHS Audit Tool</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${view === item.id ? 'bg-amber-400 text-slate-900' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
              {user?.user_metadata?.full_name?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="text-sm flex-1 min-w-0">
              <p className="text-white truncate">{user?.user_metadata?.full_name || user?.email}</p>
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <MapPin size={12} />
                <span>{selectedStation}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-20 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck size={24} />
            <span className="text-lg font-bold">SafeZone</span>
        </div>
        <Button variant="ghost" className="text-white" onClick={() => setView('dashboard')}>Menu</Button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto">

        {view === 'dashboard' && (
          <Dashboard
            audits={audits}
            onStartAudit={() => startAudit(templates[0])}
          />
        )}

        {view === 'run_audit' && activeTemplate && (
          <AuditRecorder
            template={activeTemplate}
            onSave={saveAudit}
            onCancel={() => setView('dashboard')}
          />
        )}

        {view === 'templates' && (
          <TemplateManager
            templates={templates}
            onUpdateTemplates={updateTemplates}
          />
        )}

        {view === 'reports' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Gespeicherte Berichte</h2>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {audits.length === 0 ? (
                <div className="p-8 text-center text-slate-500">Keine Berichte vorhanden.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="p-4">Datum</th>
                      <th className="p-4">Vorlage</th>
                      <th className="p-4">Standort</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Aktion</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audits.map(audit => (
                      <tr key={audit.id} className="hover:bg-slate-50">
                        <td className="p-4">{new Date(audit.date).toLocaleDateString()}</td>
                        <td className="p-4 font-medium text-slate-900">{audit.templateTitle}</td>
                        <td className="p-4">{audit.location}</td>
                        <td className="p-4">
                          <span className={`font-bold ${audit.score >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                            {audit.score}%
                          </span>
                        </td>
                        <td className="p-4"><StatusBadge status={audit.status} /></td>
                        <td className="p-4 text-right">
                          <button className="text-blue-600 hover:underline">Anzeigen</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Wrap AppContent with AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
