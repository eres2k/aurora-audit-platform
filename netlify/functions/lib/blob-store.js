// Helper to create a properly configured Netlify Blobs store
import { getStore } from '@netlify/blobs';

/**
 * Creates a Netlify Blobs store with proper configuration.
 * Handles cases where the automatic environment detection fails by
 * falling back to explicit siteID and token from environment variables.
 *
 * @param {string} name - The name of the blob store
 * @returns {object} The configured blob store
 */
export function getBlobStore(name) {
  // Try to create store with explicit configuration using environment variables
  // This is needed when NETLIFY_BLOBS_CONTEXT is not automatically set
  const siteID = process.env.SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (siteID && token) {
    return getStore({
      name,
      siteID,
      token,
    });
  }

  // Fall back to automatic environment detection (works in standard Netlify context)
  return getStore(name);
}
