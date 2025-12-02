# Netlify Environment Setup Guide

## Overview

The Aurora Audit Platform uses **Netlify Blobs** for server-side data storage. This is a simple key-value store built into Netlify - no external database required!

## How It Works

- **Audits, Templates, and Actions** are stored server-side using Netlify Blobs
- **Local storage (IndexedDB)** is used as a cache for offline support
- Data syncs automatically when online

## Storage Architecture

```
Frontend (React)
    ↓
Netlify Functions (API)
    ↓
Netlify Blobs (Server Storage)

+ LocalForage (IndexedDB) for offline cache
```

## Netlify Blobs Stores

The application uses three blob stores:

| Store Name | Description |
|------------|-------------|
| `audits` | Completed and draft audits |
| `templates` | Custom audit templates |
| `actions` | Corrective actions from failed audit items |

## Setup Requirements

### 1. Netlify Identity

Netlify Identity is used for user authentication. Enable it in your Netlify dashboard:

1. Go to **Site settings** → **Identity**
2. Click **Enable Identity**
3. Configure registration preferences (open/invite-only)
4. Optionally configure external providers (Google, GitHub, etc.)

### 2. Netlify Blobs

Netlify Blobs is automatically available on all Netlify sites. No additional configuration required!

The blob stores are created automatically when the functions first write data.

## API Endpoints

The following Netlify Functions handle data operations:

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/.netlify/functions/audits` | GET, POST, PUT, DELETE | Audit CRUD operations |
| `/.netlify/functions/templates` | GET, POST, PUT, DELETE | Template CRUD operations |
| `/.netlify/functions/actions` | GET, POST, PUT, DELETE | Action CRUD operations |
| `/.netlify/functions/stations` | GET | Get user's assigned stations |
| `/.netlify/functions/user-info` | GET | Get authenticated user info |

All endpoints require authentication via Netlify Identity.

## Local Development

For local development with Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Link to your site
netlify link

# Run local development server
netlify dev
```

This will run the functions locally with access to Netlify Blobs.

## Troubleshooting

### Issue: 401 Unauthorized errors
- **Cause**: User not logged in or token expired
- **Solution**: Ensure user is authenticated via Netlify Identity

### Issue: Data not persisting
- **Cause**: Blobs store not accessible
- **Solution**: Make sure you're running via `netlify dev` locally, or deployed to Netlify

### Issue: Offline changes not syncing
- **Cause**: Network issues or sync error
- **Solution**: Check browser console for errors, try manual refresh

## Data Backup

To export data from Netlify Blobs, you can use the Netlify CLI:

```bash
# List all blobs in a store
netlify blobs:list audits

# Get a specific blob
netlify blobs:get audits <key>
```

## Migration from Local Storage

If you have existing data in local storage (from before server-side storage), the app will automatically sync it to the server when you go online.
