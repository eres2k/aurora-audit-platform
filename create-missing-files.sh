#!/bin/bash

# Fix react-scripts not found error
# The issue: react-scripts is in devDependencies but NODE_ENV=production skips devDependencies

echo "🔧 FIXING REACT-SCRIPTS NOT FOUND ERROR"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}The problem:${NC}"
echo "NODE_ENV=production causes Netlify to skip devDependencies"
echo "react-scripts MUST be in dependencies, not devDependencies!"
echo ""

# Step 1: Fix package.json - Move react-scripts to dependencies
echo -e "${YELLOW}Step 1: Fixing package.json${NC}"
cat > package.json << 'EOF'
{
  "name": "aurora-audit-platform",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "react-router-dom": "^6.26.0",
    "@mui/material": "^5.16.0",
    "@mui/icons-material": "^5.16.0",
    "@mui/x-date-pickers": "^7.0.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@react-pdf/renderer": "^3.1.0",
    "xlsx": "^0.18.5",
    "netlify-identity-widget": "^1.9.2",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "react-dropzone": "^14.2.0",
    "recharts": "^2.10.0",
    "react-hook-form": "^7.48.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "notistack": "^3.0.1",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "@testing-library/jest-dom": "^5.16.5"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "CI=false react-scripts build",
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
  }
}
EOF
echo -e "${GREEN}✓ package.json fixed - react-scripts is now in dependencies${NC}"

# Step 2: Update netlify.toml to ensure CI=false
echo -e "${YELLOW}Step 2: Updating netlify.toml${NC}"
cat > netlify.toml << 'EOF'
[build]
  command = "CI=false npm run build"
  functions = "netlify/functions"
  publish = "build"

[build.environment]
  CI = "false"
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

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
    Referrer-Policy = "strict-origin-when-cross-origin"
EOF
echo -e "${GREEN}✓ netlify.toml updated${NC}"

# Step 3: Create a minimal public/index.html if missing
echo -e "${YELLOW}Step 3: Ensuring public/index.html exists${NC}"
mkdir -p public
if [ ! -f "public/index.html" ]; then
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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <title>Aurora Audit Platform</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF
echo -e "${GREEN}✓ public/index.html created${NC}"
else
echo -e "${GREEN}✓ public/index.html already exists${NC}"
fi

# Step 4: Create public/manifest.json
echo -e "${YELLOW}Step 4: Creating public/manifest.json${NC}"
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
  "theme_color": "#1976d2",
  "background_color": "#ffffff"
}
EOF
echo -e "${GREEN}✓ manifest.json created${NC}"

# Step 5: Create public/robots.txt
cat > public/robots.txt << 'EOF'
User-agent: *
Disallow:
EOF

# Step 6: Clear node_modules and package-lock.json
echo -e "${YELLOW}Step 5: Cleaning up old dependencies${NC}"
rm -rf node_modules package-lock.json
echo -e "${GREEN}✓ Cleaned up old files${NC}"

# Step 7: Install fresh dependencies
echo -e "${YELLOW}Step 6: Installing fresh dependencies${NC}"
echo "This may take a minute..."
npm install

# Step 8: Test build locally
echo -e "${YELLOW}Step 7: Testing build locally${NC}"
echo "Running build test..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ BUILD SUCCESSFUL!${NC}"
    echo ""
    echo "The build works locally! Now push to GitHub:"
    echo ""
    echo "1. Stage all changes:"
    echo "   git add ."
    echo ""
    echo "2. Commit:"
    echo "   git commit -m 'Fix react-scripts not found - move to dependencies'"
    echo ""
    echo "3. Push:"
    echo "   git push"
    echo ""
    echo -e "${GREEN}The Netlify build should now succeed!${NC}"
else
    echo -e "${RED}⚠️  Build still has issues locally${NC}"
    echo "Check the error messages above"
    echo ""
    echo "Common fixes:"
    echo "1. Make sure all imports are correct"
    echo "2. Check that all files exist"
    echo "3. Try: npm cache clean --force"
fi

echo ""
echo "======================================"
echo "KEY POINTS:"
echo "======================================"
echo "✅ react-scripts is now in 'dependencies' (not devDependencies)"
echo "✅ CI=false is set to allow warnings"
echo "✅ All required public files exist"
echo "✅ Fresh dependencies installed"
echo ""
echo -e "${YELLOW}IMPORTANT:${NC} The error was caused by NODE_ENV=production"
echo "which made Netlify skip devDependencies installation."
echo "react-scripts MUST be in dependencies for production builds!"