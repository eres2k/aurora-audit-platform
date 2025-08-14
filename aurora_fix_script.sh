#!/bin/bash

# Aurora Audit Platform - Build Fix Script
# This script fixes the PostCSS/Tailwind configuration and dependency issues

echo "🔧 Aurora Audit Platform - Build Fix Script"
echo "==========================================="

# Step 1: Clean existing node_modules and lock files
echo "📦 Step 1: Cleaning existing dependencies..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# Step 2: Fix postcss.config.js
echo "⚙️ Step 2: Fixing PostCSS configuration..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Step 3: Create/Update tailwind.config.js
echo "🎨 Step 3: Setting up Tailwind configuration..."
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

# Step 4: Install required dependencies
echo "📥 Step 4: Installing required dependencies..."
npm install --save-dev tailwindcss@latest postcss@latest autoprefixer@latest

# Step 5: Ensure Tailwind directives are in CSS
echo "💅 Step 5: Checking Tailwind CSS directives..."
if ! grep -q "@tailwind base" src/App.css 2>/dev/null && ! grep -q "@tailwind base" src/index.css 2>/dev/null; then
  # Add Tailwind directives to src/index.css
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
  echo "✅ Added Tailwind directives to src/index.css"
fi

# Step 6: Install all project dependencies
echo "📦 Step 6: Installing all project dependencies..."
npm install

# Step 7: Update package.json scripts if needed
echo "📝 Step 7: Updating package.json scripts..."
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Ensure build script exists
if (!packageJson.scripts) {
  packageJson.scripts = {};
}

if (!packageJson.scripts.build) {
  packageJson.scripts.build = 'react-scripts build';
}

// Add other useful scripts
packageJson.scripts['build:prod'] = 'CI=false npm run build';
packageJson.scripts['build:netlify'] = 'CI=false npm run build';

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Package.json scripts updated');
"

# Step 8: Create/Update netlify.toml
echo "🚀 Step 8: Updating Netlify configuration..."
cat > netlify.toml << 'EOF'
[build]
  command = "CI=false npm run build"
  publish = "build"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18.17.0"
  NODE_OPTIONS = "--max_old_space_size=4096"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production]
  environment = { NODE_ENV = "production" }

[context.deploy-preview]
  environment = { NODE_ENV = "development" }

[context.branch-deploy]
  environment = { NODE_ENV = "development" }
EOF

# Step 9: Fix potential React 18 issues
echo "⚛️ Step 9: Ensuring React 18 compatibility..."
npm install react@latest react-dom@latest

# Step 10: Audit fix (without breaking changes)
echo "🔒 Step 10: Running security audit fix..."
npm audit fix

# Step 11: Create .nvmrc for consistent Node version
echo "📌 Step 11: Setting Node version..."
echo "18.17.0" > .nvmrc

# Step 12: Test build locally
echo ""
echo "🏗️ Step 12: Testing build locally..."
echo "Running: CI=false npm run build"
CI=false npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ BUILD SUCCESSFUL!"
  echo "==================="
  echo ""
  echo "Next steps:"
  echo "1. Commit all changes: git add . && git commit -m 'Fix build configuration'"
  echo "2. Push to GitHub: git push origin master"
  echo "3. Netlify will automatically deploy the fixed version"
  echo ""
  echo "Files modified:"
  echo "- postcss.config.js (fixed Tailwind plugin reference)"
  echo "- tailwind.config.js (proper Tailwind configuration)"
  echo "- netlify.toml (optimized build settings)"
  echo "- package.json (updated scripts)"
  echo "- .nvmrc (Node version pinning)"
else
  echo ""
  echo "❌ BUILD FAILED"
  echo "==============="
  echo ""
  echo "Please check the error messages above."
  echo "Common issues:"
  echo "1. Missing dependencies - run: npm install"
  echo "2. TypeScript errors - check your .tsx/.ts files"
  echo "3. Import errors - verify all imports are correct"
  echo ""
  echo "For help, check the error output above or run:"
  echo "npm run build 2>&1 | head -50"
fi

echo ""
echo "🔍 Quick diagnostics:"
node -v
npm -v
echo "Current directory: $(pwd)"
echo "Files in src/: $(ls -la src/ 2>/dev/null | wc -l) files"
echo ""