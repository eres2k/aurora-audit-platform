import type { Handler, HandlerEvent } from '@netlify/functions';

const templates = [
  {
    templateId: 'safety-walk-v1',
    title: 'Safety Walk (AMZL)',
    siteTypes: ['AMZL'],
    sections: [
      {
        title: 'PPE',
        items: [
          { id: 'ppe-01', type: 'ynna', title: 'Gloves in use where required', guidance: 'Check outbound & carts' },
          { id: 'ppe-02', type: 'ynna', title: 'Hi-vis worn correctly' },
          { id: 'ppe-03', type: 'ynna', title: 'Safety shoes in good condition' }
        ]
      },
      {
        title: 'Housekeeping',
        items: [
          { id: 'hk-01', type: 'ynna', title: 'Aisles clear; no trip hazards' },
          { id: 'hk-02', type: 'ynna', title: 'Spill kits available and stocked' },
          { id: 'hk-03', type: 'ynna', title: 'Fire exits unobstructed' }
        ]
      },
      {
        title: 'Equipment',
        items: [
          { id: 'eq-01', type: 'ynna', title: 'Carts in good working condition' },
          { id: 'eq-02', type: 'ynna', title: 'Scanners properly stored when not in use' },
          { id: 'eq-03', type: 'ynna', title: 'Emergency stop buttons accessible' }
        ]
      }
    ],
    scoring: { method: 'percent-pass' }
  }
];

export const handler: Handler = async (event: HandlerEvent) => {
  const { id } = event.queryStringParameters || {};

  if (id) {
    const template = templates.find((t) => t.templateId === id);
    if (!template) {
      return { statusCode: 404, body: 'Template not found' };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(template)
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(templates)
  };
};
