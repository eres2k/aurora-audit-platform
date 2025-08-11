exports.handler = async (event, context) => {
  const { httpMethod, path, body } = event;

  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Sample data
  const sampleAudits = [
    {
      id: '1',
      title: 'Sample Audit 1',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      assignedTo: 'John Doe',
    },
    {
      id: '2',
      title: 'Sample Audit 2',
      status: 'completed',
      createdAt: new Date().toISOString(),
      assignedTo: 'Jane Smith',
    },
  ];

  switch (httpMethod) {
    case 'GET':
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(sampleAudits),
      };
    
    case 'POST':
      const newAudit = JSON.parse(body);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: Date.now().toString(),
          ...newAudit,
          createdAt: new Date().toISOString(),
        }),
      };
    
    default:
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
  }
};
