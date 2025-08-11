# Aurora Audit Platform

Professional auditing system with multi-user support, persistent storage, and comprehensive reporting.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Deploy to Netlify:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

## Features

- Multi-user authentication with Netlify Identity
- Comprehensive audit management
- Dynamic question editor
- Excel import/export
- Professional PDF reports
- Photo attachments
- Mobile optimization
- Offline support

## Development

```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
aurora-audit-platform/
├── public/
├── src/
│   ├── api/
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── utils/
├── netlify/
│   └── functions/
├── .env.example
├── netlify.toml
├── package.json
└── README.md
```

## License

MIT
