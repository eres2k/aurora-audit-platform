import netlifyIdentity from 'netlify-identity-widget';

function resolveIdentityUrl() {
  const viteUrl = (import.meta as any)?.env?.VITE_NETLIFY_IDENTITY_URL;
  if (viteUrl) {
    return viteUrl;
  }

  const reactUrl = (process.env as Record<string, string | undefined>)?.REACT_APP_NETLIFY_IDENTITY_URL;
  return reactUrl;
}

export function initIdentity() {
  const url = resolveIdentityUrl();
  if (url) {
    netlifyIdentity.init({ APIUrl: url });
  } else {
    netlifyIdentity.init();
  }
}

export function getCurrentUser() {
  return netlifyIdentity.currentUser();
}
