# Aurora Audit Platform

Modern audit management application built with React and Material-UI. The platform provides
tools for creating audits, managing question templates and exporting professional reports.

## Features
- Multi-user authentication via Netlify Identity
- Audit creation wizard with question editor
- Template and question management pages
- Responsive design optimised for mobile devices
- Prepared for Excel import/export and PDF generation

## Development
```bash
npm ci
npm test
npm run dev
```

`npm test` currently runs a placeholder test suite. Use `npm run dev` to start a local
development server.

## Deployment
The project is ready for deployment on Netlify. Connect your repository and set the build
command to `npm run build`.

---

# Aurora Audit Platform — scaffold

1. Install: npm install
2. Start dev server: npm start
3. Configure REACT_APP_NETLIFY_IDENTITY_URL in your environment for Netlify Identity

This is a minimal scaffold. Extend with templates, storage, imports, PDF export and tests as needed.

---

## Setup
1. npm install
2. Set environment variables (see docs/PRODUCTION_README.md)
3. npm start (dev) or npm run build (prod)

## Testing
- Unit: npm test
- Manual: Open app, login via Netlify Identity, create audit, add questions, export PDF/Excel
- Deploy to Netlify: Push to GitHub, connect repo, set env vars

## Features Implemented
- Auth via Netlify Identity
- Audit CRUD with Supabase
- Question editor with XLSX import/export
- Basic templates
- PWA support
- Responsive design

Expand as needed for full production (e.g., PDF generation, camera integration).
