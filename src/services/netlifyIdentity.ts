import netlifyIdentity from "netlify-identity-widget";

export function initIdentity() {
  const url = process.env.REACT_APP_NETLIFY_IDENTITY_URL;
  if (url) {
    // point the widget to the site's Identity endpoint (Netlify-hosted)
    netlifyIdentity.init({ APIUrl: url });
  } else {
    netlifyIdentity.init();
  }
}

export function getCurrentUser() {
  return netlifyIdentity.currentUser();
}
