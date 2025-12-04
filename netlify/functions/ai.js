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
    model: 'gemini-2.0-flash',
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

// Generate audit template from text description
const handleGenerateTemplate = async (prompt, category = 'Safety') => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const systemPrompt = `You are an expert audit template generator for workplace safety, quality, and compliance audits.
Based on the user's description, generate a complete audit template in JSON format.

User request: "${prompt}"

Generate a JSON object with this exact structure:
{
  "title": "Template title (clear, professional)",
  "description": "2-3 sentence description of what this audit covers",
  "category": "${category}",
  "color": "#FF9900",
  "estimatedTime": <number in minutes, estimate based on number of questions>,
  "sections": [
    {
      "id": "sec-<unique-id>",
      "title": "Section Name",
      "items": [
        {
          "id": "<unique-id>",
          "text": "Question text ending with ?",
          "type": "bool",
          "required": true,
          "critical": false
        }
      ]
    }
  ]
}

Guidelines:
- Use "bool" type for yes/no safety questions (most common)
- Use "rating" type (1-5 stars) for quality/condition assessments
- Use "options" type with an "options" array for multiple choice
- Use "text" type for open-ended observations
- Use "photo" type when visual evidence is needed
- Set "critical": true for safety-critical items that could cause injury
- Set "required": true for mandatory questions
- Generate unique IDs using format: "q1", "q2", etc. for items and "sec-1", "sec-2" for sections
- Create logical sections grouping related questions
- Include 5-15 questions per section for comprehensive coverage
- For 5S audits use: Sort, Set in Order, Shine, Standardize, Sustain sections
- For safety audits include: PPE, Fire Safety, Walkways, Emergency Equipment, etc.
- Make questions specific and actionable, not vague`;

  const result = await model.generateContent(systemPrompt);
  const response = result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response as JSON');
  }
};

// Generate audit template from image of paper form
const handleImageToTemplate = async (imageBase64) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
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

  const prompt = `You are an expert at converting paper audit forms and checklists into digital templates.

Analyze this image of an audit form/checklist and extract its structure and questions.
Convert it into a JSON audit template with this exact structure:

{
  "title": "Template title based on the form",
  "description": "Description of what this audit covers",
  "category": "Safety" | "Quality" | "Compliance" | "Operations",
  "color": "#FF9900",
  "estimatedTime": <number in minutes>,
  "sections": [
    {
      "id": "sec-<number>",
      "title": "Section Name from form",
      "items": [
        {
          "id": "q<number>",
          "text": "Question text?",
          "type": "bool" | "rating" | "options" | "text" | "photo",
          "required": true,
          "critical": false,
          "options": ["Option 1", "Option 2"] // only for "options" type
        }
      ]
    }
  ]
}

Guidelines:
- Preserve the original structure and section names from the form
- Convert checkboxes/yes-no items to "bool" type
- Convert rating scales to "rating" type
- Convert multiple choice to "options" type with the options array
- Convert open text fields to "text" type
- Add "photo" type where photo evidence seems needed
- Mark safety-critical items with "critical": true
- If the image is unclear, make reasonable assumptions based on common audit practices
- Generate unique IDs for all sections and items`;

  const imagePart = {
    inlineData: {
      data: cleanBase64,
      mimeType: mimeType,
    },
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response as JSON');
  }
};

// Process voice note and extract structured data
const handleProcessVoiceNote = async (transcript, questionContext = '') => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const prompt = `You are an AI assistant helping auditors document their findings via voice.

The auditor spoke the following while inspecting:
"${transcript}"

${questionContext ? `Context - The current audit question being answered: "${questionContext}"` : ''}

Analyze this voice note and extract structured information. Return a JSON object:
{
  "cleanedNote": "A well-formatted, professional version of what the auditor said. Clean up filler words, organize the information clearly, and make it suitable for an audit report.",
  "suggestedStatus": "pass" | "fail" | "na" | null,
  "suggestedSeverity": "low" | "medium" | "high" | null,
  "keyObservations": ["List of key findings or observations"],
  "extractedDetails": {
    "location": "Any location mentioned (aisle, area, zone)",
    "equipment": "Any equipment or items mentioned",
    "dateOrExpiry": "Any dates mentioned (like expiration dates)",
    "quantity": "Any quantities or measurements",
    "people": "Any people or roles mentioned"
  },
  "recommendedAction": "If an issue was found, suggest a corrective action"
}

Guidelines:
- suggestedStatus should be "fail" if the auditor described a problem, hazard, or non-compliance
- suggestedStatus should be "pass" if the auditor confirmed something is good/compliant
- suggestedStatus should be "na" if not applicable was mentioned
- suggestedStatus should be null if unclear
- suggestedSeverity: high = immediate danger/critical violation, medium = needs attention soon, low = minor issue
- Clean up speech artifacts like "um", "uh", "like", etc.
- Format dates consistently
- Be concise but preserve all important details`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response as JSON');
  }
};

// Austrian ASchG (Arbeitnehmerschutzgesetz) and safety policy knowledge base
const AUSTRIA_SAFETY_KNOWLEDGE = `
AUSTRIAN WORKPLACE SAFETY REGULATIONS (ASchG - ArbeitnehmerInnenschutzgesetz)

=== WALKWAY AND CLEARANCE REQUIREMENTS ===
- Main traffic routes: Minimum 1.20m width
- Secondary walkways: Minimum 0.80m width
- Emergency escape routes: Minimum 1.0m width, max 40m to exit
- Clearance around machinery: Minimum 0.50m
- Forklift routes: Minimum 1.80m for one-way, 3.0m for two-way traffic
- Door widths: Minimum 0.80m for personnel, 1.20m for emergency exits
- Ceiling height in work areas: Minimum 2.50m
- Storage aisles: Minimum 0.75m between racks

=== FIRE SAFETY (TRVB - Technische Richtlinien Vorbeugender Brandschutz) ===
- Fire extinguisher placement: Maximum 20m walking distance
- Fire extinguisher height: Handle between 0.80m-1.20m from floor
- Fire extinguisher inspection: Annual professional inspection required
- Emergency lighting: Required on all escape routes, minimum 1 lux
- Fire doors: Must close automatically, never wedged open
- Flammable storage: Maximum 20L in work area, rest in approved cabinet
- Emergency assembly points: Must be clearly marked and accessible

=== PPE REQUIREMENTS ===
- Safety footwear: Required in warehouse/production areas (EN ISO 20345 S3)
- High-visibility clothing: Required near forklift traffic
- Hearing protection: Required above 85 dB(A) exposure
- Eye protection: Required when using chemicals or near flying particles
- Hard hats: Required where overhead hazards exist
- Gloves: Chemical-resistant when handling hazardous substances

=== ERGONOMICS AND MANUAL HANDLING ===
- Maximum lifting weight: 25kg for men, 15kg for women (regular lifting)
- Occasional heavy lifts: Up to 40kg for men with proper technique
- Lifting from floor: Avoid, use platforms or lift tables
- Repetitive lifting: Risk assessment required above 5kg
- Screen work: Minimum 10-minute break every 50 minutes of continuous screen work

=== ELECTRICAL SAFETY ===
- RCD (FI) protection: Required for all socket outlets up to 32A
- Electrical inspection: Annual inspection of portable equipment
- Cable management: No cables across walkways, use proper routing
- Emergency stop buttons: Must be red/yellow, clearly visible

=== HAZARDOUS SUBSTANCES ===
- Safety Data Sheets: Must be available at point of use
- Chemical storage: Incompatible chemicals separated
- Labeling: All containers must be labeled with GHS symbols
- Ventilation: LEV required when handling volatile substances

=== EMERGENCY EQUIPMENT ===
- First aid kits: Contents per ÖNORM Z 1020
- Eye wash stations: Required where chemicals are used
- Emergency showers: Required for corrosive chemicals
- AED (Defibrillator): Recommended for sites >50 employees

=== HOUSEKEEPING AND CLEANLINESS (5S Principles) ===
- No obstructions in walkways or emergency routes
- Spills must be cleaned immediately
- Waste segregation required (general, recyclable, hazardous)
- Tools returned to designated locations after use

=== INSPECTION FREQUENCIES ===
- Fire extinguishers: Annual
- Ladders and step stools: Before each use + annual
- Lifting equipment: Annual or per manufacturer spec
- PPE: Regular inspection, replace when damaged
- Electrical tools: Annual PAT testing
- Racking systems: Annual by competent person
`;

// Policy compliance chatbot
const handlePolicyChat = async (question, conversationHistory = []) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  // Build conversation context
  let conversationContext = '';
  if (conversationHistory.length > 0) {
    conversationContext = '\n\nPrevious conversation:\n';
    conversationHistory.forEach(msg => {
      conversationContext += `${msg.role === 'user' ? 'Auditor' : 'Assistant'}: ${msg.content}\n`;
    });
  }

  const prompt = `You are AuditHub's Policy Compliance Assistant, an expert on Austrian workplace safety regulations (ASchG - ArbeitnehmerInnenschutzgesetz), OSHA standards, and general industrial safety best practices.

${AUSTRIA_SAFETY_KNOWLEDGE}

${conversationContext}

Current question from the auditor:
"${question}"

Provide a helpful, accurate response based on the safety regulations above. Return a JSON object:
{
  "answer": "Your detailed response to the question. Be specific with measurements, requirements, and references. If citing a regulation, mention it (e.g., 'According to ASchG...'). Keep the response practical and actionable.",
  "sources": ["List of relevant regulation references used"],
  "relatedTopics": ["2-3 related topics the auditor might want to know about"],
  "confidence": "high" | "medium" | "low",
  "disclaimer": "Add a disclaimer if the answer requires verification with local authorities or if regulations may have changed"
}

Guidelines:
- Always cite specific measurements and requirements when available
- If the question is outside the scope of workplace safety, politely redirect
- If unsure, indicate low confidence and recommend consulting local authorities
- Be practical - auditors need actionable information
- Reference Austrian ASchG where applicable, but also mention if EU or OSHA standards differ
- Keep answers concise but complete`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  try {
    return JSON.parse(text);
  } catch (e) {
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
    model: 'gemini-2.0-flash',
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
    const { action, audit, template, imageBase64, question, prompt, category, transcript, questionContext, conversationHistory } = body;

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

      case 'generate_template':
        if (!prompt) {
          return jsonResponse({ error: 'Prompt is required for template generation' }, 400);
        }
        result = await handleGenerateTemplate(prompt, category);
        break;

      case 'image_to_template':
        if (!imageBase64) {
          return jsonResponse({ error: 'Image data is required for template extraction' }, 400);
        }
        result = await handleImageToTemplate(imageBase64);
        break;

      case 'process_voice_note':
        if (!transcript) {
          return jsonResponse({ error: 'Transcript is required for voice processing' }, 400);
        }
        result = await handleProcessVoiceNote(transcript, questionContext);
        break;

      case 'policy_chat':
        if (!question) {
          return jsonResponse({ error: 'Question is required for policy chat' }, 400);
        }
        result = await handlePolicyChat(question, conversationHistory);
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
