# Aurora Audit Platform 🌟

A production-ready, professional auditing system built with React, featuring multi-user support, persistent storage, and comprehensive reporting capabilities.

![Aurora Audit Platform](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)
![Netlify](https://img.shields.io/badge/Netlify-Ready-00C7B7.svg)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Git
- GitHub account
- Netlify account (free tier works)

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/aurora-audit-platform.git
cd aurora-audit-platform

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm start
```

### 2. Deploy to Netlify

#### Option A: Deploy with Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

#### Option B: Deploy via GitHub

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub account and select the repository
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `build`
6. Click "Deploy site"

### 3. Configure Netlify Identity

1. In Netlify dashboard, go to your site
2. Navigate to "Identity" tab
3. Click "Enable Identity"
4. Configure registration settings:
   - Registration preferences: Invite only (recommended) or Open
   - External providers: Enable Google, GitHub, etc. (optional)
5. Update your `.env.local`:
```bash
REACT_APP_NETLIFY_IDENTITY_URL=https://your-site-name.netlify.app
```

### 4. Set Up Database (Choose One)

#### Option A: Supabase (Recommended)

1. Create account at [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → API
4. Copy your project URL and anon key
5. Update `.env.local`:
```bash
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

#### Option B: Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project
3. Enable Firestore Database
4. Get your configuration from Project Settings
5. Update `.env.local` with Firebase config

### 5. Configure Environment Variables in Netlify

1. Go to Site settings → Environment variables
2. Add all variables from `.env.local`
3. Save and redeploy

## 📁 Project Structure

```
aurora-audit-platform/
├── public/
│   ├── index.html          # Main HTML file
│   ├── manifest.json       # PWA manifest
│   └── favicon.ico         # App icon
├── src/
│   ├── components/         # React components
│   │   ├── Audit/         # Audit-related components
│   │   ├── Dashboard/     # Dashboard components
│   │   ├── Layout/        # Layout components
│   │   └── shared/        # Shared components
│   ├── services/          # API and service functions
│   ├── utils/             # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts
│   ├── App.js             # Main App component
│   └── index.js           # App entry point
├── netlify/
│   └── functions/         # Netlify Functions (serverless)
├── .env.example           # Environment variables template
├── netlify.toml           # Netlify configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## 🛠️ Available Scripts

```bash
# Development
npm start              # Start development server (port 3000)
npm test              # Run tests
npm run build         # Build for production
npm run analyze       # Analyze bundle size

# Deployment
netlify deploy        # Deploy preview
netlify deploy --prod # Deploy to production

# Database
npm run migrate       # Run database migrations
npm run seed          # Seed sample data
```

## 🔧 Configuration

### Authentication Setup

The platform uses Netlify Identity for authentication. To add users:

1. Go to Netlify Dashboard → Identity
2. Click "Invite users"
3. Enter email addresses
4. Users will receive invitation emails

### Database Schema

Create these tables in your database:

```sql
-- Users table (managed by Netlify Identity)

-- Audits table
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  template_id UUID REFERENCES templates(id),
  department VARCHAR(100),
  location VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  category VARCHAR(100),
  required BOOLEAN DEFAULT false,
  options JSONB,
  validation JSONB,
  order_index INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  questions JSONB,
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID REFERENCES audits(id),
  question_id UUID REFERENCES questions(id),
  answer JSONB,
  attachments JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 Customization

### Theme Colors

Edit `tailwind.config.js` to customize colors:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          // Your custom primary colors
          500: '#2196F3',
          600: '#1976D2',
        }
      }
    }
  }
}
```

### Logo and Branding

1. Replace `/public/logo192.png` and `/public/logo512.png`
2. Update `/public/favicon.ico`
3. Edit app name in `/public/manifest.json`

## 📱 PWA Features

The platform is a Progressive Web App with:

- ✅ Offline support
- ✅ Install prompt
- ✅ Push notifications (configurable)
- ✅ Background sync
- ✅ App shortcuts

To test PWA features:

1. Build the app: `npm run build`
2. Serve locally: `npx serve -s build`
3. Open in Chrome
4. Check PWA features in DevTools → Application

## 🔒 Security

### Best Practices Implemented

- ✅ HTTPS enforced via Netlify
- ✅ Environment variables for secrets
- ✅ CSP headers configured
- ✅ XSS protection
- ✅ SQL injection prevention
- ✅ Rate limiting (via Netlify)
- ✅ Input validation
- ✅ Secure authentication

### Additional Security Setup

1. Enable 2FA in Netlify Identity
2. Configure CORS in Netlify settings
3. Set up Web Application Firewall (WAF)
4. Regular dependency updates

## 📊 Monitoring

### Setup Analytics

1. Create account at [Google Analytics](https://analytics.google.com)
2. Get tracking ID
3. Add to environment variables:
```bash
REACT_APP_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

### Error Tracking with Sentry

1. Create account at [Sentry](https://sentry.io)
2. Create new project
3. Add DSN to environment:
```bash
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📈 Performance Optimization

- Lazy loading for routes and components
- Image optimization and compression
- Code splitting
- Bundle size monitoring
- CDN for static assets
- Service worker caching
- Database query optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- Documentation: [docs.aurora-audit.com](https://docs.aurora-audit.com)
- Issues: [GitHub Issues](https://github.com/yourusername/aurora-audit-platform/issues)
- Email: support@aurora-audit.com

## 🎯 Roadmap

- [ ] Multi-language support
- [ ] Advanced reporting dashboard
- [ ] AI-powered insights
- [ ] Mobile native apps
- [ ] Webhook integrations
- [ ] Advanced workflow automation
- [ ] Real-time collaboration
- [ ] Voice input support

## 🙏 Acknowledgments

- React team for the amazing framework
- Netlify for excellent hosting platform
- Tailwind CSS for utility-first CSS
- All contributors and users

---

**Built with ❤️ by the Aurora Team**