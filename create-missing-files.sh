#!/bin/bash

# Create Missing Files Script for Aurora Audit Platform
# Run this in your project root directory

echo "Creating missing files for Aurora Audit Platform..."

# Create src/index.css
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

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

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}
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
  "theme_color": "#2196F3",
  "background_color": "#ffffff"
}
EOF

# Create placeholder favicon (you should replace with actual icon)
touch public/favicon.ico

# Create placeholder logos (replace with actual logos)
echo "Creating placeholder logo files..."
touch public/logo192.png
touch public/logo512.png

# Create missing context files
mkdir -p src/contexts

# DataContext.js
cat > src/contexts/DataContext.js << 'EOF'
import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [audits, setAudits] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const value = {
    audits,
    setAudits,
    questions,
    setQuestions,
    templates,
    setTemplates,
    loading,
    setLoading,
    error,
    setError
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
EOF

# ThemeContext.js
cat > src/contexts/ThemeContext.js << 'EOF'
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
EOF

# NotificationContext.js
cat > src/contexts/NotificationContext.js << 'EOF'
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
EOF

# Create component directories
mkdir -p src/components/shared
mkdir -p src/components/auth
mkdir -p src/components/dashboard
mkdir -p src/components/audits
mkdir -p src/components/questions
mkdir -p src/components/templates
mkdir -p src/components/reports
mkdir -p src/components/settings
mkdir -p src/components/profile

# ErrorBoundary.js
cat > src/components/shared/ErrorBoundary.js << 'EOF'
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
EOF

# LoadingScreen.js
cat > src/components/shared/LoadingScreen.js << 'EOF'
import React from 'react';

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
EOF

# NotFound.js
cat > src/components/shared/NotFound.js << 'EOF'
import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
EOF

# PrivateRoute.js
cat > src/components/auth/PrivateRoute.js << 'EOF'
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from '../shared/LoadingScreen';

function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;
EOF

# Create placeholder components
for component in Login Dashboard AuditList AuditDetail AuditForm QuestionBank Templates Reports Settings Profile; do
  file=""
  case $component in
    Login) file="src/components/auth/Login.js" ;;
    Dashboard) file="src/components/dashboard/Dashboard.js" ;;
    Audit*) file="src/components/audits/${component}.js" ;;
    QuestionBank) file="src/components/questions/QuestionBank.js" ;;
    Templates) file="src/components/templates/Templates.js" ;;
    Reports) file="src/components/reports/Reports.js" ;;
    Settings) file="src/components/settings/Settings.js" ;;
    Profile) file="src/components/profile/Profile.js" ;;
  esac

  cat > "$file" << EOF
import React from 'react';

function ${component}() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">${component}</h1>
      <p className="text-gray-600">This is the ${component} component.</p>
    </div>
  );
}

export default ${component};
EOF
done

echo "✅ All missing files have been created!"
echo ""
echo "Next steps:"
echo "1. Replace placeholder logos and favicon with actual images"
echo "2. Run 'npm install' to ensure all dependencies are installed"
echo "3. Run 'npm start' to test locally"
echo "4. Deploy to Netlify"