// Netlify Function to get user information
// This function returns the authenticated user's information
// including their assigned stations

export const handler = async (event, context) => {
  // Get the user from the Netlify Identity context
  const { user } = context.clientContext;

  // If no user is authenticated, return 401
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  // Return user information
  return {
    statusCode: 200,
    body: JSON.stringify({
      id: user.sub,
      email: user.email,
      name: user.user_metadata?.full_name || user.email,
      role: user.app_metadata?.role || 'auditor',
      stations: user.app_metadata?.stations || ['DVI1', 'DVI2', 'DVI3', 'DAP5', 'DAP8'],
    }),
  };
};
