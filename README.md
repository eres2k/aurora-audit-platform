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
