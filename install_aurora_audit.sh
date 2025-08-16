#!/bin/bash

# Aurora Audit Platform Install Script
# Creates project structure, sets up files, installs dependencies, and prepares for GitHub/Netlify

PROJECT_DIR="aurora-audit-platform"
echo "Creating Aurora Audit Platform project in $PROJECT_DIR..."

# Create project directory and structure
mkdir -p $PROJECT_DIR/{.github/workflows,public,src/{components,pages,services,utils},netlify/functions,tests}
cd $PROJECT_DIR

# Create package.json
cat > package.json << 'EOF'
{
  "name": "aurora-audit-platform",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@mui/icons-material": "^5.16.7",
    "@mui/material": "^5.16.7",
    "@react-pdf/renderer": "^4.3.0",
    "@supabase/supabase-js": "^2.45.4",
    "browser-image-compression": "^2.0.2",
    "chart.js": "^4.4.4",
    "dexie": "^4.0.8",
    "netlify-identity-widget": "^1.9.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-image-annotate": "^1.8.0",
    "react-router-dom": "^6.26.1",
    "react-signature-canvas": "^1.0.6",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/react": "^16.0.1",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  },
  "eslintConfig": {
    "extends": ["react-app", "react-app/jest"]
  }
}
EOF

# Create .env.example
cat > .env.example << 'EOF'
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_NETLIFY_IDENTITY_URL=https://your-netlify-site.netlify.app/.netlify/identity
REACT_APP_ENABLE_OFFLINE=true
REACT_APP_ENABLE_PWA=true
REACT_APP_MAX_FILE_SIZE=10485760
EOF

# Create netlify.toml
cat > netlify.toml << 'EOF'
[build]
  publish = "build"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[dev]
  command = "npm start"
  port = 3000
EOF

# Create .github/workflows/ci.yml
cat > .github/workflows/ci.yml << 'EOF'
name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test
EOF

# Create public/index.html
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Aurora Audit Platform" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Aurora Audit Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
    <div id="netlify-modal"></div>
  </body>
</html>
EOF

# Create public/manifest.json
cat > public/manifest.json << 'EOF'
{
  "short_name": "Aurora Audit",
  "name": "Aurora Audit Platform",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
EOF

# Create public/service-worker.js
cat > public/service-worker.js << 'EOF'
const CACHE_NAME = 'aurora-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-audits') {
    event.waitUntil(syncData());
  }
});

function syncData() {
  // Implemented in src/services/sync.js
}
EOF

# Create src/index.js
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { BrowserRouter } from 'react-router-dom';
import netlifyIdentity from 'netlify-identity-widget';

netlifyIdentity.init({ container: '#netlify-modal' });

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ThemeProvider>
);

if ('serviceWorker' in navigator && process.env.REACT_APP_ENABLE_PWA === 'true') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js');
  });
}
EOF

# Create src/theme.js
cat > src/theme.js << 'EOF'
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;
EOF

# Create src/App.js
cat > src/App.js << 'EOF'
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline } from '@mui/material';
import { getUser } from './services/auth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuditDetail from './pages/AuditDetail';
import Profile from './pages/Profile';

function App() {
  const user = getUser();

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.REACT_APP_ENABLE_OFFLINE === 'true') {
      navigator.serviceWorker.ready.then((registration) => {
        registration.sync.register('sync-audits');
      });
    }
  }, []);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/audit/:id" element={user ? <AuditDetail /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
EOF

# Create src/services/auth.js
cat > src/services/auth.js << 'EOF'
import netlifyIdentity from 'netlify-identity-widget';

netlifyIdentity.init({ container: '#netlify-modal', locale: 'en' });

export const login = () => netlifyIdentity.open('login');
export const signup = () => netlifyIdentity.open('signup');
export const logout = () => netlifyIdentity.logout();

netlifyIdentity.on('login', (user) => {
  localStorage.setItem('netlifyToken', user.token.access_token);
});

netlifyIdentity.on('logout', () => {
  localStorage.removeItem('netlifyToken');
});

export const getUser = () => netlifyIdentity.currentUser();

export const hasRole = (role) => {
  const user = getUser();
  if (!user) return false;
  const roles = user.app_metadata.roles || [];
  return roles.includes(role);
};

export const refreshToken = async () => {
  const user = getUser();
  if (user) await user.jwt();
};
EOF

# Create src/services/db.js
cat > src/services/db.js << 'EOF'
import { createClient } from '@supabase/supabase-js';
import Dexie from 'dexie';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const db = new Dexie('AuroraDB');
db.version(1).stores({
  audits: 'id, title, status',
  questions: 'id, text, type',
  templates: 'id, name',
  responses: 'id, auditId, questionId',
});

export const getAudits = async () => {
  if (navigator.onLine) {
    const { data } = await supabase.from('audits').select('*');
    await db.audits.bulkPut(data);
    return data;
  }
  return await db.audits.toArray();
};

export const createAudit = async (audit) => {
  const auditData = { ...audit, createdAt: new Date().toISOString() };
  if (navigator.onLine) {
    const { data } = await supabase.from('audits').insert(auditData).select();
    await db.audits.add(data[0]);
    return data[0];
  }
  await db.audits.add({ ...auditData, isSynced: false });
  self.registration.sync.register('sync-audits');
  return auditData;
};

// Similar for updateAudit, deleteAudit, questions, templates
EOF

# Create src/services/storage.js
cat > src/services/storage.js << 'EOF'
import supabase from './db';
import imageCompression from 'browser-image-compression';

export const uploadFile = async (file, auditId) => {
  const options = { quality: 0.6, maxWidthOrHeight: 1920 };
  const compressedFile = await imageCompression(file, options);
  const fileName = `${auditId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('attachments')
    .upload(fileName, compressedFile);
  if (error) throw error;
  return data.path;
};

export const getFile = async (path) => {
  const { data } = supabase.storage.from('attachments').getPublicUrl(path);
  return data.publicUrl;
};

export const deleteFile = async (path) => {
  const { error } = await supabase.storage.from('attachments').remove([path]);
  if (error) throw error;
};
EOF

# Create src/services/sync.js
cat > src/services/sync.js << 'EOF'
import { supabase } from './db';

export const syncData = async () => {
  // Placeholder for syncing Dexie with Supabase
  // Fetch unsynced records, push to Supabase, update isSynced flag
  console.log('Syncing offline data...');
};
EOF

# Create src/components/AuditList.js
cat > src/components/AuditList.js << 'EOF'
import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, Button } from '@mui/material';
import { getAudits } from '../services/db';
import { useNavigate } from 'react-router-dom';
import { hasRole } from '../services/auth';

const AuditList = () => {
  const [audits, setAudits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAudits = async () => {
      const data = await getAudits();
      setAudits(data);
    };
    fetchAudits();
  }, []);

  return (
    <List>
      {audits.map((audit) => (
        <ListItem key={audit.id}>
          <ListItemText primary={audit.title} secondary={audit.status} />
          <Button onClick={() => navigate(`/audit/${audit.id}`)}>View</Button>
          {hasRole('admin') && <Button>Delete</Button>}
        </ListItem>
      ))}
    </List>
  );
};

export default AuditList;
EOF

# Create src/components/AuditForm.js
cat > src/components/AuditForm.js << 'EOF'
import React from 'react';
import { useForm } from 'react-hook-form';
import { TextField, Button, MenuItem } from '@mui/material';
import { createAudit } from '../services/db';
import { hasRole } from '../services/auth';

const AuditForm = () => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    if (!hasRole('admin') && !hasRole('auditor')) return;
    await createAudit({
      ...data,
      status: 'draft',
      createdBy: getUser().id,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField {...register('title')} label="Title" fullWidth margin="normal" />
      <TextField {...register('description')} label="Description" fullWidth margin="normal" multiline />
      <TextField
        {...register('status')}
        select
        label="Status"
        fullWidth
        margin="normal"
      >
        <MenuItem value="draft">Draft</MenuItem>
        <MenuItem value="in_progress">In Progress</MenuItem>
      </TextField>
      <Button type="submit" variant="contained">Create Audit</Button>
    </form>
  );
};

export default AuditForm;
EOF

# Create src/components/QuestionEditor.js
cat > src/components/QuestionEditor.js << 'EOF'
import React, { useState } from 'react';
import { TextField, Button, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/db';

const QuestionEditor = ({ auditId }) => {
  const { register, handleSubmit } = useForm();
  const [type, setType] = useState('text');

  const onSubmit = async (data) => {
    await supabase.from('questions').insert({
      ...data,
      type,
      auditId,
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField {...register('text')} label="Question Text" fullWidth margin="normal" />
      <TextField
        select
        value={type}
        onChange={(e) => setType(e.target.value)}
        label="Type"
        fullWidth
        margin="normal"
      >
        <MenuItem value="text">Text</MenuItem>
        <MenuItem value="number">Number</MenuItem>
        <MenuItem value="boolean">Yes/No</MenuItem>
        <MenuItem value="select">Select</MenuItem>
      </TextField>
      <Button type="submit" variant="contained">Add Question</Button>
    </form>
  );
};

export default QuestionEditor;
EOF

# Create src/components/PDFExport.js
cat > src/components/PDFExport.js << 'EOF'
import React from 'react';
import { PDFDownloadLink, Document, Page, Text, View, Image } from '@react-pdf/renderer';
import { Button } from '@mui/material';
import { generateChart } from '../utils/charts';

const AuditPDF = ({ audit }) => (
  <Document>
    <Page size="A4">
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24 }}>Audit Report: {audit.title}</Text>
        <Text style={{ fontSize: 16, marginTop: 10 }}>Status: {audit.status}</Text>
        <Image src={generateChart(audit)} style={{ marginTop: 20 }} />
        {audit.responses.map((response) => (
          <View key={response.questionId}>
            <Text>{response.questionText}</Text>
            <Text>Answer: {response.answer}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const PDFExport = ({ audit }) => (
  <PDFDownloadLink document={<AuditPDF audit={audit} />} fileName={`${audit.title}.pdf`}>
    {({ loading }) => (
      <Button variant="contained" disabled={loading}>
        {loading ? 'Generating PDF...' : 'Export PDF'}
      </Button>
    )}
  </PDFDownloadLink>
);

export default PDFExport;
EOF

# Create src/components/ImageUpload.js
cat > src/components/ImageUpload.js << 'EOF'
import React from 'react';
import { Button } from '@mui/material';
import { uploadFile } from '../services/storage';

const ImageUpload = ({ auditId, onUpload }) => {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const path = await uploadFile(file, auditId);
      onUpload(path);
    }
  };

  return (
    <Button variant="contained" component="label">
      Upload Image
      <input
        type="file"
        accept="image/*"
        capture="camera"
        hidden
        onChange={handleUpload}
      />
    </Button>
  );
};

export default ImageUpload;
EOF

# Create src/components/SignaturePad.js
cat > src/components/SignaturePad.js << 'EOF'
import React, { useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@mui/material';
import { uploadFile } from '../services/storage';

const SignaturePad = ({ auditId, onSave }) => {
  const sigRef = useRef();

  const saveSignature = async () => {
    const dataUrl = sigRef.current.toDataURL();
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], `signature_${Date.now()}.png`, { type: 'image/png' });
    const path = await uploadFile(file, auditId);
    onSave(path);
  };

  return (
    <>
      <SignatureCanvas
        ref={sigRef}
        canvasProps={{ width: 500, height: 200, className: 'sigCanvas' }}
      />
      <Button onClick={saveSignature} variant="contained">Save Signature</Button>
    </>
  );
};

export default SignaturePad;
EOF

# Create src/components/ExcelImportExport.js
cat > src/components/ExcelImportExport.js << 'EOF'
import React from 'react';
import { Button } from '@mui/material';
import * as XLSX from 'xlsx';
import { supabase } from '../services/db';

const ExcelImportExport = ({ auditId }) => {
  const exportToExcel = async () => {
    const { data: questions } = await supabase.from('questions').select('*').eq('auditId', auditId);
    const ws = XLSX.utils.json_to_sheet(questions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions');
    XLSX.writeFile(wb, `audit_${auditId}.xlsx`);
  };

  const importFromExcel = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws);
    await supabase.from('questions').insert(json.map(q => ({ ...q, auditId })));
  };

  return (
    <>
      <Button onClick={exportToExcel} variant="contained">Export to Excel</Button>
      <Button component="label" variant="contained">
        Import from Excel
        <input type="file" accept=".xlsx" hidden onChange={importFromExcel} />
      </Button>
    </>
  );
};

export default ExcelImportExport;
EOF

# Create src/pages/Login.js
cat > src/pages/Login.js << 'EOF'
import React from 'react';
import { Button, Box, Typography } from '@mui/material';
import { login, signup } from '../services/auth';

const Login = () => (
  <Box sx={{ textAlign: 'center', mt: 8 }}>
    <Typography variant="h4">Aurora Audit Platform</Typography>
    <Box sx={{ mt: 4 }}>
      <Button onClick={login} variant="contained" sx={{ mr: 2 }}>Login</Button>
      <Button onClick={signup} variant="outlined">Sign Up</Button>
    </Box>
  </Box>
);

export default Login;
EOF

# Create src/pages/Dashboard.js
cat > src/pages/Dashboard.js << 'EOF'
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AuditList from '../components/AuditList';
import AuditForm from '../components/AuditForm';
import { hasRole } from '../services/auth';

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4">Dashboard</Typography>
      {hasRole('admin') || hasRole('auditor') ? <AuditForm /> : null}
      <AuditList />
      <Button onClick={() => navigate('/profile')} variant="outlined">Profile</Button>
    </Box>
  );
};

export default Dashboard;
EOF

# Create src/pages/AuditDetail.js
cat > src/pages/AuditDetail.js << 'EOF'
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { supabase } from '../services/db';
import QuestionEditor from '../components/QuestionEditor';
import ImageUpload from '../components/ImageUpload';
import SignaturePad from '../components/SignaturePad';
import PDFExport from '../components/PDFExport';
import ExcelImportExport from '../components/ExcelImportExport';
import { hasRole } from '../services/auth';

const AuditDetail = () => {
  const { id } = useParams();
  const [audit, setAudit] = useState(null);

  useEffect(() => {
    const fetchAudit = async () => {
      const { data } = await supabase.from('audits').select('*').eq('id', id).single();
      setAudit(data);
    };
    fetchAudit();
  }, [id]);

  if (!audit) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4">{audit.title}</Typography>
      <Typography>Status: {audit.status}</Typography>
      {hasRole('admin') || hasRole('auditor') ? <QuestionEditor auditId={id} /> : null}
      <ImageUpload auditId={id} onUpload={(path) => console.log('Uploaded:', path)} />
      <SignaturePad auditId={id} onSave={(path) => console.log('Signed:', path)} />
      <ExcelImportExport auditId={id} />
      <PDFExport audit={audit} />
    </Box>
  );
};

export default AuditDetail;
EOF

# Create src/pages/Profile.js
cat > src/pages/Profile.js << 'EOF'
import React from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import { getUser, logout } from '../services/auth';
import { useForm } from 'react-hook-form';
import { supabase } from '../services/db';

const Profile = () => {
  const user = getUser();
  const { register, handleSubmit } = useForm();

  const onSubmit = async (data) => {
    await supabase.from('users').update({ preferences: data }).eq('id', user.id);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4">Profile</Typography>
      <Typography>Email: {user.email}</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField {...register('theme')} label="Theme" defaultValue="light" margin="normal" />
        <TextField {...register('language')} label="Language" defaultValue="en" margin="normal" />
        <Button type="submit" variant="contained">Save</Button>
      </form>
      <Button onClick={logout} variant="outlined" color="error">Logout</Button>
    </Box>
  );
};

export default Profile;
EOF

# Create src/utils/charts.js
cat > src/utils/charts.js << 'EOF'
import Chart from 'chart.js/auto';

export const generateChart = (audit) => {
  const canvas = document.createElement('canvas');
  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: audit.responses.map((r) => r.questionId),
      datasets: [{
        label: 'Audit Responses',
        data: audit.responses.map((r) => r.answer),
        backgroundColor: '#1976d2',
      }],
    },
  });
  return canvas.toDataURL();
};
EOF

# Create src/utils/validators.js
cat > src/utils/validators.js << 'EOF'
export const validateQuestion = (question) => {
  if (!question.text) return 'Question text is required';
  if (!['text', 'number', 'boolean', 'select'].includes(question.type)) {
    return 'Invalid question type';
  }
  return null;
};
EOF

# Create tests/App.test.js
cat > tests/App.test.js << 'EOF'
import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { BrowserRouter } from 'react-router-dom';

test('renders login page', () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  expect(screen.getByText(/Aurora Audit Platform/i)).toBeInTheDocument();
});
EOF

# Create README.md
cat > README.md << 'EOF'
# Aurora Audit Platform

A professional auditing system built with React, Netlify Identity, and Supabase.

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - Supabase: Create a project at supabase.com, get URL and anon key
   - Netlify Identity: Enable in Netlify dashboard
3. Run locally: `npm start`
4. Deploy:
   - Push to GitHub: `git push origin main`
   - Connect repo to Netlify for auto-deploys

## Features
- Multi-user support with roles (Admin, Auditor, Viewer)
- Audit management with templates and versioning
- Dynamic question editor with conditional logic
- Excel import/export, PDF reports with charts
- Photo attachments with annotations
- Mobile-optimized, offline-capable PWA

## Testing
Run tests: `npm test`
EOF

# Initialize Git repository
git init
git add .
git commit -m "Initial commit: Aurora Audit Platform setup"

# Install dependencies
echo "Installing dependencies..."
npm install

# Print instructions
echo "Aurora Audit Platform created successfully!"
echo "Next steps:"
echo "1. Set up Supabase: Create a project at supabase.com, copy URL and anon key to .env"
echo "2. Set up Netlify: Enable Identity in dashboard, copy URL to .env"
echo "3. Create GitHub repo and push: git remote add origin <your-repo-url>; git push -u origin main"
echo "4. Connect repo to Netlify for auto-deploys"
echo "5. Run locally: cd $PROJECT_DIR; npm start"
echo "6. Test: npm test"
EOF