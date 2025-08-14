#!/bin/bash

# Fix script for Tailwind PostCSS configuration issue
echo "🔧 Fixing PostCSS Tailwind configuration error..."

# First, let's check what's in the current postcss.config.js
echo "📋 Checking current PostCSS configuration..."
if [ -f "postcss.config.js" ]; then
    echo "Current postcss.config.js content:"
    cat postcss.config.js
    echo ""
fi

# Fix the PostCSS configuration
echo "🔧 Creating correct PostCSS configuration..."
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Also check for postcss.config.cjs variant
if [ -f "postcss.config.cjs" ]; then
    echo "📝 Found postcss.config.cjs, updating it as well..."
    cat > postcss.config.cjs << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
fi

# Check if there's a .postcssrc file that might be interfering
if [ -f ".postcssrc" ] || [ -f ".postcssrc.js" ] || [ -f ".postcssrc.json" ]; then
    echo "⚠️ Found other PostCSS config files, removing them..."
    rm -f .postcssrc .postcssrc.js .postcssrc.json
fi

# Install the correct dependencies
echo "📦 Installing correct Tailwind and PostCSS packages..."
npm uninstall @tailwindcss/postcss 2>/dev/null || true
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Create proper tailwind.config.js
echo "⚙️ Creating Tailwind configuration..."
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

# Check package.json for any incorrect PostCSS configuration
echo "📋 Checking package.json for PostCSS configuration..."
node -e "
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Remove any incorrect postcss configuration
if (packageJson.postcss) {
    console.log('Found postcss config in package.json, removing it...');
    delete packageJson.postcss;
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Removed postcss config from package.json');
}

// Check browserslist
if (!packageJson.browserslist) {
    packageJson.browserslist = {
        production: [
            '>0.2%',
            'not dead',
            'not op_mini all'
        ],
        development: [
            'last 1 chrome version',
            'last 1 firefox version',
            'last 1 safari version'
        ]
    };
    fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Added browserslist to package.json');
}
"

# Make sure CSS files have Tailwind directives
echo "💅 Ensuring Tailwind directives in CSS..."
if [ -f "src/index.css" ]; then
    if ! grep -q "@tailwind base" src/index.css; then
        cat > src/index.css.tmp << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

EOF
        cat src/index.css >> src/index.css.tmp
        mv src/index.css.tmp src/index.css
    fi
else
    cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF
fi

# Remove any @import of tailwind in App.css that might conflict
if [ -f "src/App.css" ]; then
    echo "🔍 Checking App.css for conflicting imports..."
    # Remove any Tailwind imports from App.css
    sed -i.bak '/@import.*tailwind/d' src/App.css 2>/dev/null || true
    sed -i.bak '/@tailwind/d' src/App.css 2>/dev/null || true
    rm -f src/App.css.bak
fi

# Clear node_modules and reinstall
echo "🧹 Clearing cache and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Update netlify.toml for better build process
echo "📄 Updating netlify.toml..."
cat > netlify.toml << 'EOF'
[build]
  command = "npm install && CI=false npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18.17.0"
  NODE_OPTIONS = "--max-old-space-size=4096"

[[redirects]]
  from = "/*"
  to = "/index.html"  
  status = 200
EOF

# Test build locally
echo "🏗️ Testing build locally..."
CI=false npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📦 Installed packages:"
    npm list tailwindcss postcss autoprefixer 2>/dev/null | head -10
    echo ""
    echo "🚀 Next steps:"
    echo "1. Commit all changes: git add -A && git commit -m 'Fix PostCSS Tailwind configuration'"
    echo "2. Push to Netlify: git push origin master"
else
    echo "⚠️ Build still failing locally. Let's try additional fixes..."
    
    # Try with specific versions that are known to work
    echo "📦 Installing specific compatible versions..."
    npm uninstall tailwindcss postcss autoprefixer
    npm install -D tailwindcss@3.3.0 postcss@8.4.31 autoprefixer@10.4.14
    
    # Also ensure react-scripts is up to date
    npm install react-scripts@latest
    
    echo "🏗️ Retrying build..."
    CI=false npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful with specific versions!"
    else
        echo "❌ Build still failing. Please share the error message for further debugging."
        echo ""
        echo "Debug information:"
        echo "Node version: $(node --version)"
        echo "NPM version: $(npm --version)"
        echo ""
        echo "PostCSS config:"
        cat postcss.config.js
        echo ""
        echo "Files in project:"
        ls -la
    fi
fi