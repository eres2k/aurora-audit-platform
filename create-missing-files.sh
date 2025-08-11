#!/bin/bash

echo "🚀 Fixing Tailwind CSS Build Issue"
echo "==================================="

# Fix 1: Install Tailwind as regular dependency (not devDependency)
echo "📦 Installing Tailwind CSS as dependency..."
npm uninstall tailwindcss postcss autoprefixer 2>/dev/null
npm install tailwindcss@latest postcss@latest autoprefixer@latest --save

# Fix 2: Ensure configuration files exist
echo "⚙️ Creating/updating configuration files..."

# Create minimal tailwind.config.js if missing
if [ ! -f "tailwind.config.js" ]; then
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
  echo "✅ Created tailwind.config.js"
fi

# Create postcss.config.js if missing
if [ ! -f "postcss.config.js" ]; then
  cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF
  echo "✅ Created postcss.config.js"
fi

# Fix 3: Update package.json to ensure Tailwind is in dependencies
echo "📝 Updating package.json..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Move Tailwind packages from devDependencies to dependencies
const tailwindPackages = ['tailwindcss', 'postcss', 'autoprefixer'];
tailwindPackages.forEach(pkgName => {
  if (pkg.devDependencies && pkg.devDependencies[pkgName]) {
    pkg.dependencies[pkgName] = pkg.devDependencies[pkgName];
    delete pkg.devDependencies[pkgName];
  }
});

// Ensure they exist in dependencies
if (!pkg.dependencies.tailwindcss) {
  pkg.dependencies.tailwindcss = '^3.3.0';
}
if (!pkg.dependencies.postcss) {
  pkg.dependencies.postcss = '^8.4.31';
}
if (!pkg.dependencies.autoprefixer) {
  pkg.dependencies.autoprefixer = '^10.4.16';
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Updated package.json');
"

# Fix 4: Remove package-lock.json to ensure clean install
echo "🧹 Cleaning up..."
rm -f package-lock.json

# Fix 5: Test build locally
echo "🧪 Testing build..."
npm install
npm run build

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Build successful!"
  echo ""
  echo "📋 Changes made:"
  echo "  • Moved Tailwind to dependencies (not devDependencies)"
  echo "  • Created/updated config files"
  echo "  • Cleaned package-lock.json"
  echo ""
  echo "🚀 Deploy with:"
  echo "  git add ."
  echo "  git commit -m 'Fix: Move Tailwind to dependencies for production build'"
  echo "  git push origin master"
else
  echo "❌ Build still failing. See error above."
fi