# Amazon Austria Safety Audit

Static web app emulating core SafetyCulture audit features for Amazon logistics stations in Austria.

## Features
- Mobile-first responsive UI built with Tailwind CSS
- Predefined checklists for PPE, equipment safety, hazardous substances and ergonomics
- Station selector (DVI1, DVI2, DVI3, DAP5, DAP8)
- LocalStorage persistence with export and deletion options (GDPR)
- Issue tracking and asset management
- Dashboard with compliance metrics using Chart.js
- Service worker for offline use
- Multilingual support (Deutsch/English)

## Development
```bash
npm ci
npm test
```
`npm test` outputs a placeholder message as there are no unit tests.

## Deployment
### GitHub Pages
1. Create a repository named `amazon-austria-safety-audit` and push this code.
2. In GitHub repository settings, enable **Pages** and deploy from the `main` branch root.
3. The site will be available at `https://<username>.github.io/amazon-austria-safety-audit/`.

### Netlify
1. Sign in to Netlify and select **Add new site -> Import from Git**.
2. Choose the GitHub repository and keep the default build command `npm run build` and publish directory `.`.
3. Deploy the site. Netlify will read `netlify.toml` for redirects and headers.

## Data retention
All audit data is stored locally in the browser. Users can export data as JSON for backups. For multi-user or server storage, connect Netlify Functions or other backend services respecting GDPR and retaining data for at least five years.
