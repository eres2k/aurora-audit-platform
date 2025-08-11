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

  const questions = [
    { id: '1', text: 'Is the area clean?', type: 'boolean', category: 'Safety' },
    { id: '2', text: 'Rate the condition', type: 'scale', category: 'Quality' },
  ];

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(questions),
  };
};
