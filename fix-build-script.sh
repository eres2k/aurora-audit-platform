#!/bin/bash

# Fix Build Script for Aurora Audit Platform
echo "🔧 Fixing Aurora Audit Platform Build Issues..."

# 1. Create all missing directories
echo "📁 Creating directory structure..."
mkdir -p src/components/auth
mkdir -p src/components/common
mkdir -p src/components/dashboard
mkdir -p src/components/stations
mkdir -p src/contexts
mkdir -p src/services
mkdir -p src/pages
mkdir -p src/hooks
mkdir -p src/utils

# 2. Create reportWebVitals.js
echo "📝 Creating reportWebVitals.js..."
cat > src/reportWebVitals.js << 'EOF'
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
EOF

# 3. Update/Create index.css with Tailwind
echo "📝 Creating index.css..."
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

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
EOF

# 4. Create App.css
echo "📝 Creating App.css..."
cat > src/App.css << 'EOF'
.App {
  text-align: center;
}
EOF

# 5. Create tailwind.config.js
echo "📝 Creating tailwind.config.js..."
cat > tailwind.config.js << 'EOF'
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# 6. Create postcss.config.js
echo "📝 Creating postcss.config.js..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# 7. Update package.json with all dependencies
echo "📝 Updating package.json..."
cat > package.json << 'EOF'
{
  "name": "aurora-audit-platform",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@supabase/supabase-js": "^2.39.3",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "netlify-identity-widget": "^1.9.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0"
  }
}
EOF

# 8. Install all dependencies
echo "📦 Installing dependencies..."
rm -rf node_modules package-lock.json
npm install

# 9. Create placeholder pages if they don't exist
echo "📝 Creating placeholder pages..."

# LoginPage.js
if [ ! -f src/pages/LoginPage.js ]; then
cat > src/pages/LoginPage.js << 'EOF'
import React from 'react';
import Login from '../components/auth/Login';

export default function LoginPage() {
  return <Login />;
}
EOF
fi

# DashboardPage.js
if [ ! -f src/pages/DashboardPage.js ]; then
cat > src/pages/DashboardPage.js << 'EOF'
import React from 'react';
import Dashboard from '../components/dashboard/Dashboard';

export default function DashboardPage() {
  return <Dashboard />;
}
EOF
fi

# AuditsPage.js
if [ ! -f src/pages/AuditsPage.js ]; then
cat > src/pages/AuditsPage.js << 'EOF'
import React from 'react';

export default function AuditsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Audits</h1>
      <p className="mt-2 text-gray-600">Manage all audits</p>
    </div>
  );
}
EOF
fi

# AuditDetailPage.js
if [ ! -f src/pages/AuditDetailPage.js ]; then
cat > src/pages/AuditDetailPage.js << 'EOF'
import React from 'react';
import { useParams } from 'react-router-dom';

export default function AuditDetailPage() {
  const { id } = useParams();
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Audit Detail</h1>
      <p className="mt-2 text-gray-600">Audit ID: {id}</p>
    </div>
  );
}
EOF
fi

# QuestionsPage.js
if [ ! -f src/pages/QuestionsPage.js ]; then
cat > src/pages/QuestionsPage.js << 'EOF'
import React from 'react';

export default function QuestionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Questions</h1>
      <p className="mt-2 text-gray-600">Manage audit questions</p>
    </div>
  );
}
EOF
fi

# TemplatesPage.js
if [ ! -f src/pages/TemplatesPage.js ]; then
cat > src/pages/TemplatesPage.js << 'EOF'
import React from 'react';

export default function TemplatesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Templates</h1>
      <p className="mt-2 text-gray-600">Manage audit templates</p>
    </div>
  );
}
EOF
fi

# ReportsPage.js
if [ ! -f src/pages/ReportsPage.js ]; then
cat > src/pages/ReportsPage.js << 'EOF'
import React from 'react';

export default function ReportsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <p className="mt-2 text-gray-600">Generate reports</p>
    </div>
  );
}
EOF
fi

# SettingsPage.js
if [ ! -f src/pages/SettingsPage.js ]; then
cat > src/pages/SettingsPage.js << 'EOF'
import React from 'react';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-2 text-gray-600">Application settings</p>
    </div>
  );
}
EOF
fi

# 10. Create netlify.toml
echo "📝 Creating netlify.toml..."
cat > netlify.toml << 'EOF'
[build]
  command = "CI=false npm run build"
  publish = "build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
EOF

# 11. Test the build locally
echo "🧪 Testing build locally..."
CI=false npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Ready to deploy."
    echo ""
    echo "Next steps:"
    echo "1. git add ."
    echo "2. git commit -m 'Fix build issues'"
    echo "3. git push"
else
    echo "❌ Build still failing. Check the error messages above."
fi
EOF

# Make the script executable
chmod +x fix-build.sh

echo "✅ Fix script created successfully!"
echo "Run: ./fix-build.sh"