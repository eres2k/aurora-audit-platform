exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Sample data
  const audits = [
    { id: '1', title: 'Safety Audit - Building A', status: 'completed', createdAt: '2024-01-15' },
    { id: '2', title: 'Quality Check - Line 1', status: 'in_progress', createdAt: '2024-01-14' },
    { id: '3', title: 'Compliance Review', status: 'pending', createdAt: '2024-01-13' },
  ];

  // Handle different endpoints
  const path = event.path.replace('/.netlify/functions/', '');
  
  if (path === 'audits/stats') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalAudits: 156,
        inProgress: 23,
        completed: 112,
        templates: 21,
      }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(audits),
  };
};
