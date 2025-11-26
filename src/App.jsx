import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  MapPin,
  Camera,
  Image,
  Trash2,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Users,
  Truck,
  Package,
  Warehouse,
  Heart,
  AlertCircle,
  CheckCheck,
  Eye,
  Edit3,
  PenTool,
  CalendarPlus,
  Bell,
  Filter,
  Search
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

// Amazon Logistics Vehicle Inspection Template
const VEHICLE_INSPECTION_TEMPLATE = {
  id: "tmpl_002",
  title: "Fahrzeug-Sicherheitsinspektion",
  description: "Tägliche Fahrzeugkontrolle vor der Auslieferung.",
  category: "vehicle",
  sections: [
    {
      id: "sec_exterior",
      title: "Außenbereich",
      items: [
        { id: "v1", text: "Sind alle Reifen in gutem Zustand (keine Beschädigungen, korrekter Luftdruck)?", type: "bool" },
        { id: "v2", text: "Funktionieren alle Außenlichter (Scheinwerfer, Blinker, Bremslichter)?", type: "bool" },
        { id: "v3", text: "Sind alle Spiegel vorhanden und unbeschädigt?", type: "bool" },
        { id: "v4", text: "Ist die Windschutzscheibe frei von Rissen oder Beschädigungen?", type: "bool" },
        { id: "v5", text: "Sind die Türen und Schlösser funktionsfähig?", type: "bool" }
      ]
    },
    {
      id: "sec_interior",
      title: "Innenbereich",
      items: [
        { id: "v6", text: "Funktioniert der Sicherheitsgurt ordnungsgemäß?", type: "bool" },
        { id: "v7", text: "Ist das Cockpit frei von losen Gegenständen?", type: "bool" },
        { id: "v8", text: "Funktionieren Klimaanlage/Heizung?", type: "bool" },
        { id: "v9", text: "Sind alle Warnanzeigen im Armaturenbrett aus?", type: "bool" },
        { id: "v10", text: "Ist der Erste-Hilfe-Kasten vorhanden und vollständig?", type: "bool" }
      ]
    },
    {
      id: "sec_cargo",
      title: "Ladebereich",
      items: [
        { id: "v11", text: "Ist der Ladebereich sauber und frei von Beschädigungen?", type: "bool" },
        { id: "v12", text: "Funktionieren alle Befestigungssysteme für Pakete?", type: "bool" },
        { id: "v13", text: "Ist die Laderaumbeleuchtung funktionsfähig?", type: "bool" },
        { id: "v14", text: "Sind die Laderaumtüren dicht und schließen korrekt?", type: "bool" }
      ]
    },
    {
      id: "sec_safety_equipment",
      title: "Sicherheitsausstattung",
      items: [
        { id: "v15", text: "Ist das Warndreieck vorhanden?", type: "bool" },
        { id: "v16", text: "Ist die Warnweste im Fahrzeug?", type: "bool" },
        { id: "v17", text: "Ist der Feuerlöscher vorhanden und geprüft?", type: "bool" },
        { id: "v18", text: "Ist das Verbandskasten-Verfallsdatum gültig?", type: "bool" }
      ]
    }
  ]
};

// Warehouse Safety Audit Template
const WAREHOUSE_SAFETY_TEMPLATE = {
  id: "tmpl_003",
  title: "Lagerhallen-Sicherheitsaudit",
  description: "Umfassende Sicherheitsprüfung für Lagerbereiche.",
  category: "warehouse",
  sections: [
    {
      id: "sec_floor",
      title: "Boden & Verkehrswege",
      items: [
        { id: "w1", text: "Sind alle Markierungen für Fußgänger- und Fahrzeugwege sichtbar?", type: "bool" },
        { id: "w2", text: "Ist der Boden frei von Öl, Wasser oder anderen Rutschgefahren?", type: "bool" },
        { id: "w3", text: "Sind alle Flucht- und Rettungswege frei und gekennzeichnet?", type: "bool" },
        { id: "w4", text: "Sind Bodenmarkierungen für Palettenstellplätze eingehalten?", type: "bool" }
      ]
    },
    {
      id: "sec_racking",
      title: "Regalsysteme",
      items: [
        { id: "w5", text: "Sind alle Regale stabil und ohne sichtbare Beschädigungen?", type: "bool" },
        { id: "w6", text: "Sind Gewichtslimits deutlich angezeigt und eingehalten?", type: "bool" },
        { id: "w7", text: "Sind Regalschutzbügel vorhanden und unbeschädigt?", type: "bool" },
        { id: "w8", text: "Sind beschädigte Regalteile markiert und gesperrt?", type: "bool" }
      ]
    },
    {
      id: "sec_equipment",
      title: "Geräte & Maschinen",
      items: [
        { id: "w9", text: "Sind alle Gabelstapler täglich inspiziert?", type: "bool" },
        { id: "w10", text: "Tragen Gabelstaplerfahrer die erforderliche Schutzausrüstung?", type: "bool" },
        { id: "w11", text: "Sind alle elektrischen Geräte ordnungsgemäß geerdet?", type: "bool" },
        { id: "w12", text: "Funktionieren alle Not-Aus-Schalter?", type: "bool" }
      ]
    },
    {
      id: "sec_fire_safety",
      title: "Brandschutz",
      items: [
        { id: "w13", text: "Sind alle Feuerlöscher zugänglich und geprüft?", type: "bool" },
        { id: "w14", text: "Ist der Abstand zu Sprinklerköpfen (min. 45cm) eingehalten?", type: "bool" },
        { id: "w15", text: "Sind Brandmeldeanlagen funktionsfähig?", type: "bool" },
        { id: "w16", text: "Ist brennbares Material ordnungsgemäß gelagert?", type: "bool" }
      ]
    }
  ]
};

// Loading Dock Safety Template
const LOADING_DOCK_TEMPLATE = {
  id: "tmpl_004",
  title: "Laderampen-Sicherheit",
  description: "Sicherheitsprüfung für Be- und Entladebereiche.",
  category: "dock",
  sections: [
    {
      id: "sec_dock_area",
      title: "Rampenbereich",
      items: [
        { id: "d1", text: "Sind alle Rampenplatten/Brücken in gutem Zustand?", type: "bool" },
        { id: "d2", text: "Funktionieren alle Rampentore und Verschlüsse?", type: "bool" },
        { id: "d3", text: "Sind Radkeile für LKW verfügbar und in Gebrauch?", type: "bool" },
        { id: "d4", text: "Ist die Beleuchtung im Rampenbereich ausreichend?", type: "bool" }
      ]
    },
    {
      id: "sec_dock_safety",
      title: "Sicherheitsmaßnahmen",
      items: [
        { id: "d5", text: "Sind Warnsignale (Ampeln) an den Toren funktionsfähig?", type: "bool" },
        { id: "d6", text: "Ist der Bereich frei von Stolpergefahren?", type: "bool" },
        { id: "d7", text: "Sind Absturzsicherungen an offenen Toren vorhanden?", type: "bool" },
        { id: "d8", text: "Tragen alle Mitarbeiter im Bereich Warnwesten?", type: "bool" }
      ]
    },
    {
      id: "sec_loading_process",
      title: "Beladungsprozess",
      items: [
        { id: "d9", text: "Werden schwere Pakete unten und leichte oben gestapelt?", type: "bool" },
        { id: "d10", text: "Wird das maximale Stapelgewicht eingehalten?", type: "bool" },
        { id: "d11", text: "Sind alle Ladungssicherungsmittel verfügbar?", type: "bool" },
        { id: "d12", text: "Wird die Kommunikation zwischen Fahrer und Lader eingehalten?", type: "bool" }
      ]
    }
  ]
};

// Driver Safety Checklist Template
const DRIVER_SAFETY_TEMPLATE = {
  id: "tmpl_005",
  title: "Fahrer-Sicherheitscheckliste",
  description: "Persönliche Sicherheitsprüfung für Auslieferungsfahrer.",
  category: "driver",
  sections: [
    {
      id: "sec_driver_readiness",
      title: "Fahrer-Bereitschaft",
      items: [
        { id: "dr1", text: "Hat der Fahrer seine Ruhezeiten eingehalten?", type: "bool" },
        { id: "dr2", text: "Ist der Fahrer in körperlich und geistig gutem Zustand?", type: "bool" },
        { id: "dr3", text: "Hat der Fahrer alle erforderlichen Dokumente (Führerschein, ID)?", type: "bool" },
        { id: "dr4", text: "Ist der Fahrer mit der heutigen Route vertraut?", type: "bool" }
      ]
    },
    {
      id: "sec_ppe_driver",
      title: "Persönliche Schutzausrüstung",
      items: [
        { id: "dr5", text: "Trägt der Fahrer Sicherheitsschuhe?", type: "bool" },
        { id: "dr6", text: "Ist die Warnweste griffbereit?", type: "bool" },
        { id: "dr7", text: "Sind bei Bedarf Handschuhe vorhanden?", type: "bool" },
        { id: "dr8", text: "Ist bei extremer Witterung entsprechende Schutzkleidung vorhanden?", type: "bool" }
      ]
    },
    {
      id: "sec_delivery_equipment",
      title: "Auslieferungs-Equipment",
      items: [
        { id: "dr9", text: "Ist das mobile Gerät (Scanner) voll geladen?", type: "bool" },
        { id: "dr10", text: "Ist das Mobiltelefon für Notfälle verfügbar?", type: "bool" },
        { id: "dr11", text: "Sind genügend Zustellkarten/Benachrichtigungen vorhanden?", type: "bool" },
        { id: "dr12", text: "Ist der Handwagen/Sackkarre in gutem Zustand?", type: "bool" }
      ]
    }
  ]
};

// First Aid & Emergency Readiness Template
const EMERGENCY_READINESS_TEMPLATE = {
  id: "tmpl_006",
  title: "Erste-Hilfe & Notfallbereitschaft",
  description: "Überprüfung der Notfallausrüstung und -prozesse.",
  category: "emergency",
  sections: [
    {
      id: "sec_first_aid",
      title: "Erste-Hilfe-Ausstattung",
      items: [
        { id: "e1", text: "Sind alle Erste-Hilfe-Kästen vollständig bestückt?", type: "bool" },
        { id: "e2", text: "Sind Verfallsdaten aller Artikel gültig?", type: "bool" },
        { id: "e3", text: "Sind AED-Geräte (falls vorhanden) funktionsfähig?", type: "bool" },
        { id: "e4", text: "Sind Augenspülstationen vorhanden und zugänglich?", type: "bool" }
      ]
    },
    {
      id: "sec_emergency_exits",
      title: "Notausgänge & Evakuierung",
      items: [
        { id: "e5", text: "Sind alle Notausgänge frei und gekennzeichnet?", type: "bool" },
        { id: "e6", text: "Funktioniert die Notbeleuchtung?", type: "bool" },
        { id: "e7", text: "Sind Evakuierungspläne aktuell und sichtbar ausgehängt?", type: "bool" },
        { id: "e8", text: "Ist der Sammelplatz gekennzeichnet und bekannt?", type: "bool" }
      ]
    },
    {
      id: "sec_trained_personnel",
      title: "Geschultes Personal",
      items: [
        { id: "e9", text: "Sind Ersthelfer während der Schicht anwesend?", type: "bool" },
        { id: "e10", text: "Sind Brandschutzhelfer benannt und geschult?", type: "bool" },
        { id: "e11", text: "Sind Notfallrufnummern sichtbar ausgehängt?", type: "bool" },
        { id: "e12", text: "Wurde die letzte Evakuierungsübung dokumentiert?", type: "bool" }
      ]
    }
  ]
};

// Ergonomics & Manual Handling Template
const ERGONOMICS_TEMPLATE = {
  id: "tmpl_007",
  title: "Ergonomie & Manuelle Handhabung",
  description: "Prüfung der ergonomischen Arbeitsplatzgestaltung.",
  category: "ergonomics",
  sections: [
    {
      id: "sec_lifting",
      title: "Heben & Tragen",
      items: [
        { id: "er1", text: "Verwenden Mitarbeiter korrekte Hebetechniken (Kraftzone)?", type: "bool" },
        { id: "er2", text: "Werden Hilfsmittel für schwere Lasten bereitgestellt?", type: "bool" },
        { id: "er3", text: "Sind Gewichtslimits für manuelles Heben eingehalten (<23kg)?", type: "bool" },
        { id: "er4", text: "Werden Team-Lifts bei Bedarf durchgeführt?", type: "bool" }
      ]
    },
    {
      id: "sec_workstation",
      title: "Arbeitsplatzgestaltung",
      items: [
        { id: "er5", text: "Sind Arbeitshöhen angemessen für die Mitarbeiter?", type: "bool" },
        { id: "er6", text: "Sind Anti-Ermüdungsmatten an Steharbeitsplätzen vorhanden?", type: "bool" },
        { id: "er7", text: "Ist ausreichend Platz für Bewegung vorhanden?", type: "bool" },
        { id: "er8", text: "Sind häufig benötigte Gegenstände in Greifnähe?", type: "bool" }
      ]
    },
    {
      id: "sec_breaks",
      title: "Pausen & Rotation",
      items: [
        { id: "er9", text: "Werden regelmäßige Pausen eingehalten?", type: "bool" },
        { id: "er10", text: "Findet Aufgabenrotation statt, um Belastungen zu reduzieren?", type: "bool" },
        { id: "er11", text: "Sind Pausenräume angemessen ausgestattet?", type: "bool" },
        { id: "er12", text: "Haben Mitarbeiter Zugang zu Trinkwasser?", type: "bool" }
      ]
    }
  ]
};

// All default templates
const ALL_DEFAULT_TEMPLATES = [
  DEFAULT_TEMPLATE,
  VEHICLE_INSPECTION_TEMPLATE,
  WAREHOUSE_SAFETY_TEMPLATE,
  LOADING_DOCK_TEMPLATE,
  DRIVER_SAFETY_TEMPLATE,
  EMERGENCY_READINESS_TEMPLATE,
  ERGONOMICS_TEMPLATE
];

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
    failed: "bg-red-100 text-red-800",
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    overdue: "bg-red-100 text-red-800"
  };

  const labels = {
    completed: "Abgeschlossen",
    draft: "Entwurf",
    failed: "Durchgefallen",
    open: "Offen",
    in_progress: "In Bearbeitung",
    overdue: "Überfällig"
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  );
};

// --- PHOTO CAPTURE COMPONENT ---
const PhotoCapture = ({ photos = [], onPhotosChange, maxPhotos = 5 }) => {
  const fileInputRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > maxPhotos) {
      alert(`Maximal ${maxPhotos} Fotos erlaubt.`);
      return;
    }

    const newPhotos = await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              dataUrl: reader.result,
              name: file.name,
              timestamp: new Date().toISOString()
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    onPhotosChange([...photos, ...newPhotos]);
    e.target.value = '';
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Kamera-Fehler:', err);
      alert('Kamera konnte nicht gestartet werden. Bitte Berechtigungen prüfen.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const newPhoto = {
      id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataUrl,
      name: `Foto_${new Date().toLocaleTimeString()}.jpg`,
      timestamp: new Date().toISOString()
    };

    onPhotosChange([...photos, newPhoto]);
    stopCamera();
  };

  const removePhoto = (photoId) => {
    onPhotosChange(photos.filter(p => p.id !== photoId));
  };

  return (
    <div className="space-y-3">
      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200">
              <img
                src={photo.dataUrl}
                alt={photo.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Camera View */}
      {showCamera && (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full aspect-video"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={capturePhoto}
              className="p-4 bg-white rounded-full shadow-lg hover:bg-slate-100"
            >
              <Camera size={24} className="text-slate-800" />
            </button>
            <button
              onClick={stopCamera}
              className="p-4 bg-red-500 rounded-full shadow-lg hover:bg-red-600"
            >
              <X size={24} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Photo Actions */}
      {photos.length < maxPhotos && !showCamera && (
        <div className="flex gap-2">
          <button
            onClick={startCamera}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Camera size={18} />
            <span className="text-sm">Kamera</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 p-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Image size={18} />
            <span className="text-sm">Galerie</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        {photos.length}/{maxPhotos} Fotos
      </p>
    </div>
  );
};

// --- SIGNATURE PAD COMPONENT ---
const SignaturePad = ({ onSignatureChange, signature = null }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If we have a saved signature, draw it
    if (signature) {
      const img = new window.Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = signature;
      setIsEmpty(false);
    }
  }, []);

  const getCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoords(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="relative border-2 border-dashed border-slate-300 rounded-lg bg-white">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-400 text-sm">Hier unterschreiben...</p>
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          onClick={clearSignature}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <Trash2 size={14} />
          Löschen
        </button>
      </div>
    </div>
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
const Dashboard = ({ audits, onStartAudit, templates, actions, onNavigate }) => {
  const [showAiReport, setShowAiReport] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const stats = useMemo(() => {
    const total = audits.length;
    const completed = audits.filter(a => a.status === 'completed').length;
    const avgScore = completed > 0
      ? Math.round(audits.filter(a => a.status === 'completed').reduce((acc, curr) => acc + curr.score, 0) / completed)
      : 0;

    // This week's audits
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekAudits = audits.filter(a => new Date(a.date) >= weekStart);
    const thisWeekScore = thisWeekAudits.length > 0
      ? Math.round(thisWeekAudits.reduce((acc, curr) => acc + curr.score, 0) / thisWeekAudits.length)
      : 0;

    // Last week's audits for trend calculation
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);
    const lastWeekAudits = audits.filter(a => {
      const d = new Date(a.date);
      return d >= lastWeekStart && d < lastWeekEnd;
    });
    const lastWeekScore = lastWeekAudits.length > 0
      ? Math.round(lastWeekAudits.reduce((acc, curr) => acc + curr.score, 0) / lastWeekAudits.length)
      : 0;

    const trend = thisWeekScore - lastWeekScore;
    const openActions = actions?.filter(a => a.status === 'open').length || 0;

    return { total, completed, avgScore, thisWeekAudits: thisWeekAudits.length, thisWeekScore, trend, openActions };
  }, [audits, actions]);

  const templateIcons = {
    vehicle: Truck,
    warehouse: Warehouse,
    dock: Package,
    driver: Users,
    emergency: Heart,
    ergonomics: Users,
    default: ClipboardList
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {showAiReport && <AiReportModal audits={audits} onClose={() => setShowAiReport(false)} />}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Audit-Vorlage auswählen</h3>
                <p className="text-sm text-slate-500">Wählen Sie eine Vorlage für Ihr Audit</p>
              </div>
              <button onClick={() => setShowTemplateSelector(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates.map(template => {
                const IconComponent = templateIcons[template.category] || templateIcons.default;
                return (
                  <button
                    key={template.id}
                    onClick={() => {
                      setShowTemplateSelector(false);
                      onStartAudit(template);
                    }}
                    className="p-4 border border-slate-200 rounded-lg text-left hover:border-amber-400 hover:bg-amber-50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-amber-100 transition-colors">
                        <IconComponent size={20} className="text-slate-600 group-hover:text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate">{template.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                            {template.sections?.length || 0} Sektionen
                          </span>
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                            {template.sections?.reduce((acc, s) => acc + (s.items?.length || 0), 0) || 0} Fragen
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}

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
          <Button variant="accent" icon={Plus} onClick={() => setShowTemplateSelector(true)}>Neues Audit</Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          {stats.trend !== 0 && (
            <div className={`mt-2 flex items-center gap-1 text-xs ${stats.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {Math.abs(stats.trend)}% vs. letzte Woche
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Diese Woche</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.thisWeekAudits}</h3>
            </div>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Calendar size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">
            {stats.thisWeekScore > 0 && `Ø ${stats.thisWeekScore}% Score`}
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Audits Gesamt</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.total}</h3>
            </div>
            <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">Alle Zeiträume</p>
        </Card>

        <Card className={`p-6 cursor-pointer hover:shadow-md transition-shadow ${stats.openActions > 0 ? 'border-l-4 border-l-red-500' : ''}`} onClick={() => onNavigate?.('actions')}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Offene Aktionen</p>
              <h3 className={`text-3xl font-bold mt-1 ${stats.openActions > 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {stats.openActions}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${stats.openActions > 0 ? 'bg-red-100 text-red-600' : 'bg-purple-100 text-purple-600'}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
          <p className="text-sm text-slate-400 mt-4">
            {stats.openActions > 0 ? 'Klicken zum Anzeigen' : 'Keine offenen Aufgaben'}
          </p>
        </Card>
      </div>

      {/* Quick Start Templates */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Schnellstart</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {templates.slice(0, 4).map(template => {
            const IconComponent = templateIcons[template.category] || templateIcons.default;
            return (
              <button
                key={template.id}
                onClick={() => onStartAudit(template)}
                className="p-4 bg-white border border-slate-200 rounded-xl hover:border-amber-400 hover:shadow-md transition-all text-left group"
              >
                <div className="p-2 bg-slate-100 rounded-lg w-fit group-hover:bg-amber-100 transition-colors mb-3">
                  <IconComponent size={20} className="text-slate-600 group-hover:text-amber-600" />
                </div>
                <h4 className="font-medium text-slate-900 text-sm line-clamp-2">{template.title}</h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Letzte Aktivitäten</h3>
        <div className="space-y-3">
          {audits.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <ClipboardList className="mx-auto text-slate-400 mb-3" size={40} />
              <p className="text-slate-500">Noch keine Audits durchgeführt.</p>
              <p className="text-sm text-slate-400 mt-1">Starten Sie jetzt Ihr erstes Audit!</p>
              <Button variant="accent" icon={Plus} onClick={() => setShowTemplateSelector(true)} className="mt-4">
                Audit starten
              </Button>
            </div>
          ) : (
            audits.slice(0, 5).map(audit => (
              <Card key={audit.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${audit.score >= 90 ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <FileText size={20} className={audit.score >= 90 ? 'text-green-600' : 'text-amber-600'} />
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
const AuditRecorder = ({ template, onSave, onCancel, onCreateAction }) => {
  const { selectedStation } = useAuth();
  const [answers, setAnswers] = useState({});
  const [notes, setNotes] = useState({});
  const [globalNotes, setGlobalNotes] = useState("");
  const [photos, setPhotos] = useState({}); // Photos per question ID
  const [signature, setSignature] = useState(null);
  const [showSignature, setShowSignature] = useState(false);

  // AI State
  const [aiLoading, setAiLoading] = useState(null); // ID of question being processed
  const [aiSuggestions, setAiSuggestions] = useState({}); // Store suggestions per question ID

  const handlePhotoChange = (questionId, questionPhotos) => {
    setPhotos(prev => ({ ...prev, [questionId]: questionPhotos }));
  };

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
    if (!signature) {
      setShowSignature(true);
      return;
    }

    const score = calculateScore();
    const failedItems = template.sections.flatMap(section =>
      section.items.filter(item => answers[item.id] === 'fail').map(item => ({
        ...item,
        sectionTitle: section.title,
        note: notes[item.id],
        photos: photos[item.id] || []
      }))
    );

    onSave({
      answers,
      itemNotes: notes,
      itemPhotos: photos,
      score,
      location: selectedStation,
      notes: globalNotes,
      signature,
      failedItems,
      status: 'completed',
      date: new Date().toISOString()
    });
  };

  const handleSignAndComplete = () => {
    if (!signature) {
      alert('Bitte unterschreiben Sie das Audit.');
      return;
    }
    setShowSignature(false);
    handleFinish();
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
                    placeholder="Problem beschreiben..."
                    className="w-full text-sm p-2 bg-red-50 border border-red-100 rounded-md text-red-800 placeholder:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-200"
                    rows={3}
                  />

                  {/* Photo Capture for Failed Items */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <p className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
                      <Camera size={14} />
                      Foto-Dokumentation
                    </p>
                    <PhotoCapture
                      photos={photos[item.id] || []}
                      onPhotosChange={(newPhotos) => handlePhotoChange(item.id, newPhotos)}
                      maxPhotos={3}
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ))}

      {/* Signature Modal */}
      {showSignature && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PenTool size={20} className="text-amber-500" />
                Audit abschließen
              </h3>
              <button onClick={() => setShowSignature(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Endpunktzahl:</span>
                  <span className={`text-2xl font-bold ${currentScore >= 90 ? 'text-green-600' : 'text-amber-600'}`}>
                    {currentScore}%
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {Object.values(answers).filter(v => v === 'fail').length} Risiken gefunden
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unterschrift des Auditors
                </label>
                <SignaturePad
                  signature={signature}
                  onSignatureChange={setSignature}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setShowSignature(false)} className="flex-1">
                  Zurück
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSignAndComplete}
                  className="flex-1"
                  icon={CheckCheck}
                >
                  Unterschreiben & Abschließen
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

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

// --- ACTIONS/ISSUES MANAGER ---
const ActionsManager = ({ actions, onUpdateActions, audits }) => {
  const [filter, setFilter] = useState('all'); // all, open, in_progress, completed
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAction, setEditingAction] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const priorityLabels = {
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig'
  };

  const filteredActions = actions.filter(action => {
    const matchesFilter = filter === 'all' || action.status === filter;
    const matchesSearch = searchTerm === '' ||
      action.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const updateAction = (actionId, updates) => {
    const updatedActions = actions.map(a =>
      a.id === actionId ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
    );
    onUpdateActions(updatedActions);
  };

  const deleteAction = (actionId) => {
    if (confirm('Aktion wirklich löschen?')) {
      onUpdateActions(actions.filter(a => a.id !== actionId));
    }
  };

  const createAction = (newAction) => {
    const action = {
      id: `action_${Date.now()}`,
      ...newAction,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onUpdateActions([action, ...actions]);
    setShowCreateModal(false);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && editingAction?.status !== 'completed';
  };

  const stats = {
    open: actions.filter(a => a.status === 'open').length,
    in_progress: actions.filter(a => a.status === 'in_progress').length,
    completed: actions.filter(a => a.status === 'completed').length,
    overdue: actions.filter(a => isOverdue(a.dueDate) && a.status !== 'completed').length
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Aktionen & Maßnahmen</h2>
          <p className="text-slate-500">Verfolgen Sie Korrekturmaßnahmen aus Audits</p>
        </div>
        <Button variant="accent" icon={Plus} onClick={() => setShowCreateModal(true)}>
          Neue Aktion
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('open')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Offen</p>
              <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
            </div>
            <AlertCircle className="text-blue-500" size={24} />
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('in_progress')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">In Bearbeitung</p>
              <p className="text-2xl font-bold text-purple-600">{stats.in_progress}</p>
            </div>
            <Clock className="text-purple-500" size={24} />
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setFilter('completed')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Erledigt</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCheck className="text-green-500" size={24} />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Überfällig</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <AlertTriangle className="text-red-500" size={24} />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Aktionen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'in_progress', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'all' ? 'Alle' : f === 'open' ? 'Offen' : f === 'in_progress' ? 'In Bearbeitung' : 'Erledigt'}
            </button>
          ))}
        </div>
      </div>

      {/* Actions List */}
      <div className="space-y-3">
        {filteredActions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <AlertCircle className="mx-auto text-slate-400 mb-3" size={40} />
            <p className="text-slate-500">Keine Aktionen gefunden.</p>
            <p className="text-sm text-slate-400 mt-1">Erstellen Sie eine neue Aktion oder ändern Sie den Filter.</p>
          </div>
        ) : (
          filteredActions.map(action => (
            <Card key={action.id} className={`p-4 border-l-4 ${
              action.status === 'completed' ? 'border-l-green-500 bg-green-50/30' :
              isOverdue(action.dueDate) ? 'border-l-red-500' :
              action.status === 'in_progress' ? 'border-l-purple-500' : 'border-l-blue-500'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => updateAction(action.id, {
                        status: action.status === 'completed' ? 'open' : 'completed'
                      })}
                      className={`mt-1 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        action.status === 'completed'
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-slate-300 hover:border-green-500'
                      }`}
                    >
                      {action.status === 'completed' && <CheckCircle size={14} />}
                    </button>
                    <div className="flex-1">
                      <h4 className={`font-medium ${action.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {action.title}
                      </h4>
                      {action.description && (
                        <p className="text-sm text-slate-500 mt-1">{action.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColors[action.priority]}`}>
                          {priorityLabels[action.priority]}
                        </span>
                        {action.assignee && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
                            <Users size={12} />
                            {action.assignee}
                          </span>
                        )}
                        {action.dueDate && (
                          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isOverdue(action.dueDate) && action.status !== 'completed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            <Calendar size={12} />
                            {new Date(action.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {action.auditId && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center gap-1">
                            <FileText size={12} />
                            Aus Audit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={action.status}
                    onChange={(e) => updateAction(action.id, { status: e.target.value })}
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-amber-400 outline-none"
                  >
                    <option value="open">Offen</option>
                    <option value="in_progress">In Bearbeitung</option>
                    <option value="completed">Erledigt</option>
                  </select>
                  <button
                    onClick={() => setEditingAction(action)}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteAction(action.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingAction) && (
        <ActionModal
          action={editingAction}
          onSave={(data) => {
            if (editingAction) {
              updateAction(editingAction.id, data);
              setEditingAction(null);
            } else {
              createAction(data);
            }
          }}
          onClose={() => {
            setEditingAction(null);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

// Action Create/Edit Modal
const ActionModal = ({ action, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: action?.title || '',
    description: action?.description || '',
    priority: action?.priority || 'medium',
    status: action?.status || 'open',
    assignee: action?.assignee || '',
    dueDate: action?.dueDate || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Bitte geben Sie einen Titel ein.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {action ? 'Aktion bearbeiten' : 'Neue Aktion erstellen'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titel *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              placeholder="Was muss erledigt werden?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Beschreibung</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              rows={3}
              placeholder="Zusätzliche Details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priorität</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              >
                <option value="open">Offen</option>
                <option value="in_progress">In Bearbeitung</option>
                <option value="completed">Erledigt</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Verantwortlich</label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
                placeholder="Name eingeben..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fällig am</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              {action ? 'Speichern' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- SCHEDULE MANAGER ---
const ScheduleManager = ({ schedules, onUpdateSchedules, templates, onStartAudit }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const createSchedule = (scheduleData) => {
    const schedule = {
      id: `schedule_${Date.now()}`,
      ...scheduleData,
      createdAt: new Date().toISOString(),
      nextDue: calculateNextDue(scheduleData.frequency, scheduleData.startDate)
    };
    onUpdateSchedules([schedule, ...schedules]);
    setShowCreateModal(false);
  };

  const deleteSchedule = (scheduleId) => {
    if (confirm('Zeitplan wirklich löschen?')) {
      onUpdateSchedules(schedules.filter(s => s.id !== scheduleId));
    }
  };

  const calculateNextDue = (frequency, startDate) => {
    const start = new Date(startDate);
    const now = new Date();
    let next = new Date(start);

    while (next <= now) {
      switch (frequency) {
        case 'daily':
          next.setDate(next.getDate() + 1);
          break;
        case 'weekly':
          next.setDate(next.getDate() + 7);
          break;
        case 'monthly':
          next.setMonth(next.getMonth() + 1);
          break;
        default:
          next.setDate(next.getDate() + 1);
      }
    }
    return next.toISOString();
  };

  const frequencyLabels = {
    daily: 'Täglich',
    weekly: 'Wöchentlich',
    monthly: 'Monatlich'
  };

  const isDueSoon = (nextDue) => {
    const due = new Date(nextDue);
    const now = new Date();
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Zeitpläne</h2>
          <p className="text-slate-500">Planen Sie wiederkehrende Audits</p>
        </div>
        <Button variant="accent" icon={CalendarPlus} onClick={() => setShowCreateModal(true)}>
          Neuer Zeitplan
        </Button>
      </div>

      {/* Scheduled Audits */}
      <div className="space-y-4">
        {schedules.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <Calendar className="mx-auto text-slate-400 mb-3" size={40} />
            <p className="text-slate-500">Keine Zeitpläne eingerichtet.</p>
            <p className="text-sm text-slate-400 mt-1">Erstellen Sie einen Zeitplan für wiederkehrende Audits.</p>
          </div>
        ) : (
          schedules.map(schedule => {
            const template = templates.find(t => t.id === schedule.templateId);
            return (
              <Card key={schedule.id} className={`p-4 ${isDueSoon(schedule.nextDue) ? 'border-l-4 border-l-amber-500' : ''}`}>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900">{template?.title || 'Unbekannte Vorlage'}</h4>
                      {isDueSoon(schedule.nextDue) && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
                          <Bell size={12} />
                          Fällig
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {frequencyLabels[schedule.frequency]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Nächstes: {new Date(schedule.nextDue).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {schedule.station}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={() => onStartAudit(template)}
                      className="text-sm"
                    >
                      Audit starten
                    </Button>
                    <button
                      onClick={() => deleteSchedule(schedule.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Schedule Modal */}
      {showCreateModal && (
        <ScheduleModal
          templates={templates}
          onSave={createSchedule}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

// Schedule Create Modal
const ScheduleModal = ({ templates, onSave, onClose }) => {
  const { selectedStation } = useAuth();
  const [formData, setFormData] = useState({
    templateId: templates[0]?.id || '',
    frequency: 'daily',
    startDate: new Date().toISOString().split('T')[0],
    station: selectedStation
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.templateId) {
      alert('Bitte wählen Sie eine Vorlage.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Neuen Zeitplan erstellen</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Audit-Vorlage</label>
            <select
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
            >
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Häufigkeit</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              >
                <option value="daily">Täglich</option>
                <option value="weekly">Wöchentlich</option>
                <option value="monthly">Monatlich</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Startdatum</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button type="submit" variant="primary" className="flex-1">
              Erstellen
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// --- MAIN APP SHELL ---
function AppContent() {
  const { user, selectedStation, logout, isAuthenticated, hasSelectedStation, loading } = useAuth();
  const [view, setView] = useState('dashboard'); // dashboard, audit, templates, reports, actions, schedules
  const [activeTemplate, setActiveTemplate] = useState(null);

  // "Netlify Blobs" Simulation via LocalStorage
  const [templates, setTemplates] = useState(ALL_DEFAULT_TEMPLATES);
  const [audits, setAudits] = useState([]);
  const [actions, setActions] = useState([]); // Actions/Issues tracking
  const [schedules, setSchedules] = useState([]); // Scheduled audits

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
    const storedActions = localStorage.getItem('safezone_actions');
    const storedSchedules = localStorage.getItem('safezone_schedules');
    if (storedAudits) setAudits(JSON.parse(storedAudits));
    if (storedTemplates) {
      setTemplates(JSON.parse(storedTemplates));
    } else {
      // If no stored templates, save all defaults
      localStorage.setItem('safezone_templates', JSON.stringify(ALL_DEFAULT_TEMPLATES));
    }
    if (storedActions) setActions(JSON.parse(storedActions));
    if (storedSchedules) setSchedules(JSON.parse(storedSchedules));
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

    // Create actions from failed items
    createActionsFromAudit(auditData, newAudit.id);

    setView('dashboard');
    setActiveTemplate(null);
  };

  const updateTemplates = (newTemplates) => {
    setTemplates(newTemplates);
    localStorage.setItem('safezone_templates', JSON.stringify(newTemplates));
  };

  const updateActions = (newActions) => {
    setActions(newActions);
    localStorage.setItem('safezone_actions', JSON.stringify(newActions));
  };

  const updateSchedules = (newSchedules) => {
    setSchedules(newSchedules);
    localStorage.setItem('safezone_schedules', JSON.stringify(newSchedules));
  };

  const startAudit = (template = templates[0]) => {
    if (!template) return;
    setActiveTemplate(template);
    setView('run_audit');
  };

  // Create actions from audit failures
  const createActionsFromAudit = (auditData, auditId) => {
    if (!auditData.failedItems || auditData.failedItems.length === 0) return;

    const newActions = auditData.failedItems.map(item => ({
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: item.text,
      description: item.note || `Aus Audit: ${item.sectionTitle}`,
      priority: 'medium',
      status: 'open',
      auditId,
      station: auditData.location,
      photos: item.photos,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    updateActions([...newActions, ...actions]);
  };

  // Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'actions', label: 'Aktionen', icon: Target, badge: actions.filter(a => a.status === 'open').length },
    { id: 'schedules', label: 'Zeitpläne', icon: Calendar },
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
              {item.badge > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
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
            templates={templates}
            actions={actions}
            onStartAudit={startAudit}
            onNavigate={setView}
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

        {view === 'actions' && (
          <ActionsManager
            actions={actions}
            onUpdateActions={updateActions}
            audits={audits}
          />
        )}

        {view === 'schedules' && (
          <ScheduleManager
            schedules={schedules}
            onUpdateSchedules={updateSchedules}
            templates={templates}
            onStartAudit={startAudit}
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
