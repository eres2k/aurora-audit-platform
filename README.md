# Aurora Audit Platform

A professional auditing system built with React, Netlify Identity, and Supabase.

## Setup
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - Supabase: Create a project at supabase.com, get URL and anon key
   - Netlify Identity: Enable in Netlify dashboard
3. Run locally: `npm start`
4. Deploy:
   - Push to GitHub: `git push origin main`
   - Connect repo to Netlify for auto-deploys

## Features
- Multi-user support with roles (Admin, Auditor, Viewer)
- Audit management with templates and versioning
- Dynamic question editor with conditional logic
- Excel import/export, PDF reports with charts
- Photo attachments with annotations
- Mobile-optimized, offline-capable PWA

## Testing
Run tests: `npm test`
