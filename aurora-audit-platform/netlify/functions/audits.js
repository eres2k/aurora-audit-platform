exports.handler = async (event, context) => {
  // Check authentication
  const { user } = context.clientContext;
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  const { httpMethod, path, body } = event;

  // Handle different HTTP methods
  switch (httpMethod) {
    case 'GET':
      return {
        statusCode: 200,
        body: JSON.stringify({
          audits: [],
          message: 'Audits retrieved successfully',
        }),
      };
    
    case 'POST':
      const data = JSON.parse(body);
      return {
        statusCode: 201,
        body: JSON.stringify({
          audit: { id: Date.now().toString(), ...data },
          message: 'Audit created successfully',
        }),
      };
    
    default:
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
  }
};
