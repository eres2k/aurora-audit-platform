#!/bin/bash

# Fix Tailwind CSS Setup
echo "🎨 Fixing Tailwind CSS Setup..."

# 1. Install Tailwind and its dependencies
echo "📦 Installing Tailwind CSS..."
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# 2. Create proper tailwind.config.js
echo "⚙️ Creating tailwind.config.js..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
}
EOF

# 3. Create postcss.config.js
echo "⚙️ Creating postcss.config.js..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 4. Create/Update src/index.css with Tailwind directives
echo "🎨 Creating src/index.css with Tailwind directives..."
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

/* Utility classes for when Tailwind is loading */
.min-h-screen {
  min-height: 100vh;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode base styles */
.dark {
  color-scheme: dark;
}
EOF

# 5. Update src/index.js to import CSS
echo "📝 Updating src/index.js..."
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import reportWebVitals from './reportWebVitals';

// Initialize Netlify Identity Widget if available
if (typeof window !== 'undefined' && window.netlifyIdentity) {
  window.netlifyIdentity.init();
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
EOF

# 6. Update src/App.js to ensure it doesn't have Tailwind issues
echo "📝 Updating src/App.js..."
cat > src/App.js << 'EOF'
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import StationManager from './components/stations/StationManager';
import AuditsPage from './pages/AuditsPage';
import QuestionsPage from './pages/QuestionsPage';
import TemplatesPage from './pages/TemplatesPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Add Netlify Identity widget script if not already present
    if (!document.querySelector('script[src*="netlify-identity-widget"]')) {
      const script = document.createElement('script');
      script.src = 'https://identity.netlify.com/v1/netlify-identity-widget.js';
      document.head.appendChild(script);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Aurora Audit Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="stations" element={<StationManager />} />
        <Route path="audits" element={<AuditsPage />} />
        <Route path="audits/:id" element={<AuditsPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
EOF

# 7. Ensure public/index.html is correct
echo "📝 Updating public/index.html..."
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Aurora Audit Platform - Professional auditing made simple"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Aurora Audit Platform</title>
    
    <!-- Netlify Identity Widget -->
    <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

# 8. Create a simple App.css (empty or minimal)
echo "📝 Creating App.css..."
cat > src/App.css << 'EOF'
/* App specific styles - using Tailwind for most styling */
EOF

# 9. Run build to compile Tailwind
echo "🔨 Building the application..."
CI=false npm run build

if [ $? -eq 0 ]; then
    echo "✅ Tailwind CSS setup complete and build successful!"
    echo ""
    echo "Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'Fix: Complete Tailwind CSS setup'"
    echo "3. git push"
else
    echo "⚠️ Build failed. Checking for additional issues..."
    echo "Try running: npm start"
    echo "This will show more detailed error messages"
fi
EOF

chmod +x fix-tailwind-setup.sh
echo "✅ Script created! Run: ./fix-tailwind-setup.sh"