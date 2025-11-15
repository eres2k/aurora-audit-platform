# Netlify Environment Setup Guide

## Critical: Required Environment Variables

The Aurora Audit Platform requires the following environment variables to be set in your Netlify deployment. Without these, the application will fail with 500 errors when trying to complete audits or perform other operations.

### Required Variables

Navigate to **Site settings > Environment variables** in your Netlify dashboard and add:

| Variable Name | Description | Where to Find |
|--------------|-------------|---------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous/public key | Supabase Dashboard → Settings → API → Project API keys → `anon` `public` |

### How to Add Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site (auroraauditplatform)
3. Navigate to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. For each variable:
   - Enter the **Key** (e.g., `SUPABASE_URL`)
   - Enter the **Value** (copy from Supabase dashboard)
   - Select which contexts to apply to (Production, Deploy previews, Branch deploys)
6. Click **Create variable**
7. After adding all variables, trigger a new deployment

### Verifying the Setup

After setting the environment variables and deploying:

1. Open your browser's developer console (F12)
2. Try to complete an audit
3. If you see a 500 error with message "Missing required Supabase configuration", the environment variables are not set correctly
4. Check the Netlify function logs for detailed error messages

### Common Issues

**Issue**: Functions return 500 error with "Server configuration error"
- **Cause**: Environment variables not set in Netlify
- **Solution**: Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as described above

**Issue**: Functions work locally but fail in production
- **Cause**: `.env.local` file is only used for local development
- **Solution**: Set the environment variables in Netlify dashboard (without the `REACT_APP_` prefix)

**Issue**: Variables set but still getting errors
- **Cause**: Deployment hasn't picked up the new environment variables
- **Solution**: Trigger a new deployment after adding variables

### Supabase Database Schema

Ensure your Supabase database has the following tables:

#### audits table
```sql
CREATE TABLE audits (
  audit_id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audits_site_id ON audits(site_id);
CREATE INDEX idx_audits_year_month ON audits(year, month);
```

#### audit_index table
```sql
CREATE TABLE audit_index (
  site_id TEXT NOT NULL,
  year_month TEXT NOT NULL,
  audits JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (site_id, year_month)
);
```

#### actions table
```sql
CREATE TABLE actions (
  action_id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_actions_site_id ON actions(site_id);
```

### Media Storage Setup

The application uses Supabase Storage for media uploads. Create a bucket named `media`:

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `media`
3. Set the bucket to **Public** if you want direct access to images
4. Configure appropriate RLS policies if needed

### Environment Variables Reference

For reference, the local development uses these variables (in `.env.local`):
- `REACT_APP_SUPABASE_URL` - Frontend only
- `REACT_APP_SUPABASE_ANON_KEY` - Frontend only

The Netlify Functions use these variables (must be set in Netlify dashboard):
- `SUPABASE_URL` - Backend functions
- `SUPABASE_ANON_KEY` - Backend functions

Note the different naming convention: Frontend uses `REACT_APP_` prefix, backend does not.
