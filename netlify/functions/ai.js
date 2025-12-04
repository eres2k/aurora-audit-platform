import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Helper to create JSON response
const jsonResponse = (data, statusCode = 200) => ({
  statusCode,
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

// Convert audit object to readable text for summarization
const auditToReadableText = (audit, template) => {
  let text = `AUDIT REPORT\n`;
  text += `============\n\n`;
  text += `Template: ${audit.templateTitle || template?.title || 'Unknown'}\n`;
  text += `Location: ${audit.location || 'Not specified'}\n`;
  text += `Auditor: ${audit.createdBy || 'Unknown'}\n`;
  text += `Date: ${audit.date || 'Unknown'}\n`;
  text += `Score: ${audit.score || 0}%\n\n`;

  if (template?.sections) {
    template.sections.forEach((section, sectionIndex) => {
      text += `\n--- ${section.title} ---\n`;
      section.items.forEach((item, itemIndex) => {
        const answer = audit.answers?.[item.id] || 'Not answered';
        const note = audit.notes?.[item.id];
        const isCritical = item.critical ? ' [CRITICAL]' : '';

        text += `\n${sectionIndex + 1}.${itemIndex + 1}${isCritical} ${item.text}\n`;
        text += `   Answer: ${answer}\n`;
        if (note) {
          text += `   Note: ${note}\n`;
        }
      });
    });
  }

  if (audit.globalNotes) {
    text += `\n\nGLOBAL NOTES:\n${audit.globalNotes}\n`;
  }

  return text;
};

// Summarize audit action
const handleSummarize = async (audit, template) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const auditText = auditToReadableText(audit, template);

  const prompt = `You are a safety and compliance expert analyzing an audit report.
Based on the following audit data, generate a professional executive summary.

${auditText}

Return a JSON object with the following structure:
{
  "executiveSummary": "A 2-3 sentence high-level summary of the audit findings",
  "overallStatus": "PASS" | "NEEDS_ATTENTION" | "CRITICAL",
  "keyRisks": [
    {
      "risk": "Description of the risk",
      "severity": "low" | "medium" | "high",
      "area": "The section or area where this risk was found"
    }
  ],
  "recommendations": [
    {
      "priority": "immediate" | "short-term" | "long-term",
      "action": "Specific action to take",
      "impact": "Expected impact of taking this action"
    }
  ],
  "positiveFindings": ["List of things that were done well"],
  "complianceScore": "A letter grade A-F based on the audit results"
}

Focus on actionable insights. If there are critical items that failed, emphasize those.
If the score is high and no critical issues, acknowledge the good performance.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Parse the JSON response
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from the response if it has extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response as JSON');
  }
};

// Analyze image for safety compliance
const handleAnalyzeImage = async (imageBase64, question) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-lite',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  // Clean up base64 string if it includes the data URL prefix
  let cleanBase64 = imageBase64;
  let mimeType = 'image/jpeg';

  if (imageBase64.includes('data:')) {
    const matches = imageBase64.match(/data:([^;]+);base64,(.+)/);
    if (matches) {
      mimeType = matches[1];
      cleanBase64 = matches[2];
    }
  }

  const prompt = `You are a workplace safety and compliance inspector analyzing an image.

Context: This image was captured during a safety audit for the following inspection item:
"${question || 'General safety inspection'}"

Analyze this image for any safety hazards, compliance issues, or concerns.

Return a JSON object with exactly this structure:
{
  "hazardDetected": true or false,
  "severity": "low" | "medium" | "high",
  "description": "Detailed description of what you observe and any hazards found",
  "recommendation": "Specific corrective action or recommendation",
  "complianceStatus": "compliant" | "non-compliant" | "needs-review",
  "confidence": "low" | "medium" | "high"
}

Guidelines:
- Set hazardDetected to true only if you identify actual safety concerns
- severity should reflect the potential harm: low (minor/cosmetic), medium (could cause injury), high (immediate danger)
- Be specific in descriptions - mention what you see and why it's a concern
- Recommendations should be actionable
- If the image is unclear or you cannot determine safety status, set confidence to "low"`;

  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType: mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response;
  const text = response.text();

  // Parse the JSON response
  try {
    return JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from the response if it has extra text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response as JSON');
  }
};

export const handler = async (event, context) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse({});
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // Check authentication
  const user = context.clientContext?.user;
  if (!user) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  // Check for API key
  if (!process.env.GEMINI_API_KEY) {
    return jsonResponse({ error: 'Gemini API key not configured' }, 500);
  }

  try {
    const body = JSON.parse(event.body);
    const { action, audit, template, imageBase64, question } = body;

    if (!action) {
      return jsonResponse({ error: 'Action is required' }, 400);
    }

    let result;

    switch (action) {
      case 'summarize':
        if (!audit) {
          return jsonResponse({ error: 'Audit data is required for summarization' }, 400);
        }
        result = await handleSummarize(audit, template);
        break;

      case 'analyze_image':
        if (!imageBase64) {
          return jsonResponse({ error: 'Image data is required for analysis' }, 400);
        }
        result = await handleAnalyzeImage(imageBase64, question);
        break;

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }

    return jsonResponse({ success: true, data: result });

  } catch (error) {
    console.error('AI function error:', error);
    return jsonResponse({
      error: 'AI processing failed',
      message: error.message
    }, 500);
  }
};
