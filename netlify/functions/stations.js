// Netlify Function to get available stations
// This function returns the list of stations a user can access

exports.handler = async (event, context) => {
  // Get the user from the Netlify Identity context
  const { user } = context.clientContext;

  // If no user is authenticated, return 401
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  // Get user's assigned stations from app_metadata
  // If not set, return all stations
  const userStations = user.app_metadata?.stations || [
    'DVI1',
    'DVI2',
    'DVI3',
    'DAP5',
    'DAP8',
  ];

  // Station metadata
  const stationDetails = {
    DVI1: { id: 'DVI1', name: 'Distribution Center 1', type: 'distribution', active: true },
    DVI2: { id: 'DVI2', name: 'Distribution Center 2', type: 'distribution', active: true },
    DVI3: { id: 'DVI3', name: 'Distribution Center 3', type: 'distribution', active: true },
    DAP5: { id: 'DAP5', name: 'Delivery Station 5', type: 'delivery', active: true },
    DAP8: { id: 'DAP8', name: 'Delivery Station 8', type: 'delivery', active: true },
  };

  // Build response with full station details
  const stations = userStations.map((stationId) => ({
    ...stationDetails[stationId],
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({
      stations,
      total: stations.length,
    }),
  };
};
