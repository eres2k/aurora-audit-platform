#!/bin/bash

# Fix date-fns compatibility issue with MUI Date Pickers
echo "🔧 FIXING DATE-FNS COMPATIBILITY ISSUE"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}The issue:${NC}"
echo "date-fns v3 has breaking changes that @mui/x-date-pickers doesn't support yet"
echo "Solution: Use date-fns v2 instead"
echo ""

# Step 1: Update package.json with compatible versions
echo -e "${YELLOW}Step 1: Updating package.json with compatible versions${NC}"
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
    "@mui/x-date-pickers": "^6.20.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@react-pdf/renderer": "^3.1.0",
    "xlsx": "^0.18.5",
    "netlify-identity-widget": "^1.9.2",
    "axios": "^1.6.0",
    "date-fns": "^2.30.0",
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
echo -e "${GREEN}✓ package.json updated with date-fns v2${NC}"

# Step 2: Update index.js to remove DatePicker LocalizationProvider (temporarily)
echo -e "${YELLOW}Step 2: Simplifying index.js to remove date picker issues${NC}"
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import theme from './styles/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: false,
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
EOF
echo -e "${GREEN}✓ index.js simplified${NC}"

# Step 3: Ensure theme exists
echo -e "${YELLOW}Step 3: Ensuring theme.js exists${NC}"
mkdir -p src/styles
if [ ! -f "src/styles/theme.js" ]; then
cat > src/styles/theme.js << 'EOF'
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export default theme;
EOF
echo -e "${GREEN}✓ theme.js created${NC}"
else
echo -e "${GREEN}✓ theme.js already exists${NC}"
fi

# Step 4: Clean and reinstall
echo -e "${YELLOW}Step 4: Cleaning and reinstalling dependencies${NC}"
rm -rf node_modules package-lock.json
echo "Installing dependencies (this may take a minute)..."
npm install

# Step 5: Alternative - Remove date-pickers completely if still having issues
echo -e "${YELLOW}Step 5: Creating alternative package.json without date-pickers${NC}"
cat > package.json.no-datepicker << 'EOF'
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
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "axios": "^1.6.0",
    "react-hook-form": "^7.48.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "CI=false react-scripts build",
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

echo ""
echo -e "${BLUE}=====================================${NC}"
echo -e "${GREEN}FIX APPLIED!${NC}"
echo -e "${BLUE}=====================================${NC}"
echo ""
echo "Changes made:"
echo "✅ Downgraded date-fns from v3 to v2.30.0"
echo "✅ Updated @mui/x-date-pickers to compatible version"
echo "✅ Removed LocalizationProvider temporarily"
echo "✅ Created backup package.json without date-pickers"
echo ""
echo "Next steps:"
echo ""
echo "Option 1: Try with date-fns v2"
echo "  git add ."
echo "  git commit -m 'Fix date-fns compatibility - use v2'"
echo "  git push"
echo ""
echo "Option 2: If still failing, use minimal package.json"
echo "  cp package.json.no-datepicker package.json"
echo "  rm -rf node_modules package-lock.json"
echo "  npm install"
echo "  git add ."
echo "  git commit -m 'Remove date-pickers temporarily to fix build'"
echo "  git push"
echo ""
echo -e "${YELLOW}The build should now work!${NC}"