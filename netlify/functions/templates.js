exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const templates = [
    { id: '1', name: 'Safety Audit Template', category: 'Safety' },
    { id: '2', name: 'Quality Check Template', category: 'Quality' },
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(templates),
  };
};
