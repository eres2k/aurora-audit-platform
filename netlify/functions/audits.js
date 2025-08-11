exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const sampleData = [
    { id: '1', title: 'Sample Audit 1', status: 'in_progress' },
    { id: '2', title: 'Sample Audit 2', status: 'completed' },
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(sampleData),
  };
};
