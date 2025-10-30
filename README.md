# AMZL Mobile Audit App

A simplified, mobile-first SafetyCulture-style app for Amazon Logistics (AMZL) warehouse audits. Enables supervisors/WHS to run audits on phones, capture evidence, assign actions, and persist completed audits on Netlify.

## Features

- **User Authentication**: Email/password or magic link with role-based access (WHS Admin, Site Manager, Coordinator, Viewer)
- **Audit Templates**: Predefined for AMZL (Safety Walk, GTDR spot-check, etc.)
- **Mobile Audit Flow**: Checklist items (Yes/No/N.A.), notes, photos, severity, due dates, corrective actions, signatures
- **Offline-First PWA**: Start/continue audits without network; sync on reconnect
- **Persistence**: Completed audits in Netlify Blobs; listing & read-only view; PDF export
- **Dashboard**: My Open Actions, My Audits, Site summary
- **Basic Reporting**: Pass rate, top 5 recurring findings, WoW trends

## Tech Stack

- **Frontend**: React + Vite + TypeScript, TailwindCSS, shadcn/ui
- **PWA**: Service Worker + Web App Manifest, IndexedDB for offline
- **Backend**: Netlify Functions (TypeScript), Netlify Blobs for storage
- **Auth**: Netlify Identity with roles
- **Deployment**: Netlify with EU region

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure:
   ```
   VITE_APP_NAME=amzl-audit
   VITE_SITE_URL=https://your-site.netlify.app
   ```
4. Start dev server: `npm run dev`
5. Open http://localhost:5173

## Deployment

1. Connect GitHub repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables in Netlify dashboard
5. Enable Netlify Identity and Blobs
6. Deploy

## Role Seeding

Use Netlify Identity admin panel to create users and assign roles via app_metadata:

```json
{
  "role": "WHS_ADMIN",
  "site_ids": ["DVI3", "FRA1"]
}
```

## Testing

- **Unit Tests**: `npm test` (placeholder)
- **Manual Testing**: Login, start audit offline, sync, view completed, export PDF
- **E2E**: Use Playwright for critical flows

## API Endpoints

- `POST /.netlify/functions/auth-userinfo` - Get user profile
- `GET /.netlify/functions/templates` - List templates
- `POST /.netlify/functions/audits` - Create/update draft
- `POST /.netlify/functions/audits?action=complete` - Complete audit
- `GET /.netlify/functions/audits` - List completed audits
- `POST /.netlify/functions/media-upload` - Get upload URL
- `POST /.netlify/functions/actions` - Create action
- `POST /.netlify/functions/export-pdf` - Generate PDF

## Data Model

Audits stored in Netlify Blobs under `audits/{siteId}/{yyyy}/{mm}/{auditId}.json`

Templates hardcoded in functions for MVP.

## Contributing

1. Branch from `main`
2. Make changes
3. Test locally
4. Create PR with description
5. Deploy preview for testing
- Audit CRUD with Supabase
- Question editor with XLSX import/export
- Basic templates
- PWA support
- Responsive design

Expand as needed for full production (e.g., PDF generation, camera integration).
