# Aurora Audit Platform

Aurora Audit Platform is a safety culture auditing tool for Amazon Austria Logistics stations (DVI1, DVI2, DVI3, DAP5, DAP8). The application digitizes checklists aligned with the Austrian ArbeitnehmerInnenschutzgesetz (ASchG) and provides PDF exports and analytics.

## Features
- Netlify Identity based login
- Station selection for the five Austrian logistics stations
- Mobile-friendly audit checklists covering ASchG topics
- Photo capture, severity ratings and notes
- Data storage using Netlify Blobs with CRUD operations
- Professional PDF export of audits
- Analytics dashboard with compliance trends via Chart.js
- Offline support through a basic service worker

## Tech Stack
- React 18 with React Router
- Tailwind CSS
- Netlify Functions & Blobs
- jsPDF for PDF generation
- Chart.js for analytics

## Development
```bash
npm install
npm start
```
App runs on `http://localhost:3000`.

## Testing
```bash
npm test
```

## Deployment
1. Push the repository to GitHub.
2. On Netlify, create a new site from GitHub and select this repo.
3. Build command: `npm run build`
4. Publish directory: `build`
5. Enable Netlify Identity and set `NETLIFY_BLOBS_TOKEN` environment variable.

## License
MIT
