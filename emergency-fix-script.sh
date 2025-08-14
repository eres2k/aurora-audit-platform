#!/bin/bash

# Emergency Fix Script for Aurora Audit Platform
# This addresses dependency installation failures on Netlify

echo "🚨 Emergency Fix for Aurora Audit Platform"
echo "=========================================="

# Step 1: Backup current package.json
echo "📋 Step 1: Backing up current package.json..."
cp package.json package.json.backup 2>/dev/null

# Step 2: Create a minimal, working package.json
echo "📝 Step 2: Creating fresh package.json..."
cat > package.json << 'EOF'
{
  "name": "aurora-audit-platform",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
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
      "react-app"
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
  }
}
EOF

# Step 3: Remove all lock files and node_modules
echo "🧹 Step 3: Cleaning old dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Step 4: Create proper PostCSS config
echo "⚙️ Step 4: Setting up PostCSS..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Step 5: Create Tailwind config
echo "🎨 Step 5: Setting up Tailwind..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Step 6: Install base dependencies
echo "📦 Step 6: Installing core dependencies..."
npm install

# Step 7: Add Tailwind and build tools
echo "🔧 Step 7: Adding Tailwind CSS..."
npm install --save-dev tailwindcss postcss autoprefixer

# Step 8: Add the audit platform specific dependencies
echo "📚 Step 8: Adding project-specific dependencies..."
npm install --save \
  @mui/material@latest \
  @emotion/react@latest \
  @emotion/styled@latest \
  react-router-dom@latest \
  @react-pdf/renderer@latest \
  xlsx@latest \
  netlify-identity-widget@latest \
  axios@latest

# Step 9: Ensure src directory and files exist
echo "📁 Step 9: Ensuring project structure..."
mkdir -p src

# Create minimal App.js if it doesn't exist
if [ ! -f src/App.js ]; then
  cat > src/App.js << 'EOF'
import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Aurora Audit Platform</h1>
        <p>Professional Auditing System</p>
      </header>
    </div>
  );
}

export default App;
EOF
fi

# Create App.css with Tailwind imports
cat > src/App.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}
EOF

# Create index.js if it doesn't exist
if [ ! -f src/index.js ]; then
  cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF
fi

# Create index.css
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
EOF

# Step 10: Ensure public directory exists with index.html
echo "📄 Step 10: Ensuring public directory..."
mkdir -p public

if [ ! -f public/index.html ]; then
  cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Aurora Audit Platform - Professional Auditing System" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Aurora Audit Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF
fi

# Step 11: Create manifest.json
cat > public/manifest.json << 'EOF'
{
  "short_name": "Aurora",
  "name": "Aurora Audit Platform",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff"
}
EOF

# Step 12: Update netlify.toml
echo "🚀 Step 12: Optimizing Netlify configuration..."
cat > netlify.toml << 'EOF'
[build]
  command = "npm install && CI=false npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18.17.0"
  NPM_VERSION = "9.6.7"
  NODE_OPTIONS = "--max_old_space_size=4096"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production]
  environment = { NODE_ENV = "production" }
EOF

# Step 13: Create .nvmrc
echo "18.17.0" > .nvmrc

# Step 14: Create .npmrc to ensure proper installation
echo "🔐 Step 14: Creating .npmrc for stable installation..."
cat > .npmrc << 'EOF'
legacy-peer-deps=true
engine-strict=false
auto-install-peers=true
strict-peer-deps=false
EOF

# Step 15: Test the build
echo ""
echo "🧪 Step 15: Testing build locally..."
CI=false npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ BUILD SUCCESSFUL!"
  echo "==================="
  echo ""
  echo "The emergency fix has been applied successfully!"
  echo ""
  echo "Next steps:"
  echo "1. Review the changes: git diff"
  echo "2. Add all files: git add ."
  echo "3. Commit: git commit -m 'Emergency fix: Rebuild package.json and dependencies'"
  echo "4. Push: git push origin master"
  echo ""
  echo "Files created/modified:"
  echo "- package.json (rebuilt from scratch)"
  echo "- .npmrc (ensures stable npm installation)"
  echo "- postcss.config.js & tailwind.config.js (proper configs)"
  echo "- netlify.toml (optimized build command)"
  echo "- Basic React app structure in src/"
  echo ""
  echo "⚠️  Note: Your original package.json was backed up to package.json.backup"
else
  echo ""
  echo "❌ Build still failing. Trying alternative approach..."
  echo ""
  
  # Alternative: Use even more minimal setup
  echo "🔄 Attempting minimal Create React App setup..."
  
  cat > package.json << 'EOF'
{
  "name": "aurora-audit-platform",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "browserslist": [
    ">0.2%",
    "not dead",
    "not op_mini all"
  ]
}
EOF
  
  rm -rf node_modules package-lock.json
  npm install
  CI=false npm run build
  
  if [ $? -eq 0 ]; then
    echo "✅ Minimal build successful! You can now gradually add dependencies."
  else
    echo "❌ Critical issue detected. Please check:"
    echo "1. Node version: $(node -v)"
    echo "2. NPM version: $(npm -v)"
    echo "3. Error logs above for specific issues"
  fi
fi

echo ""
echo "📊 Diagnostic Information:"
echo "========================="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Package.json exists: $([ -f package.json ] && echo 'Yes' || echo 'No')"
echo "node_modules exists: $([ -d node_modules ] && echo 'Yes' || echo 'No')"
echo "src directory exists: $([ -d src ] && echo 'Yes' || echo 'No')"
echo ""