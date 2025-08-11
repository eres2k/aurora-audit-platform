// Netlify Function for PDF Export
// Generates professional PDF reports for audits

const PDFDocument = require('pdfkit');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { auditId, format = 'pdf' } = JSON.parse(event.body);

    // Validate input
    if (!auditId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Audit ID is required' })
      };
    }

    // Fetch audit data
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*')
      .eq('id', auditId)
      .single();

    if (auditError || !audit) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Audit not found' })
      };
    }

    // Fetch responses
    const { data: responses, error: responsesError } = await supabase
      .from('responses')
      .select('*, questions(*)')
      .eq('audit_id', auditId);

    if (responsesError) {
      throw responsesError;
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(audit, responses);

    // Return PDF as base64
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="audit-${auditId}.pdf"`
      },
      body: pdfBuffer.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to generate PDF' })
    };
  }
};

async function generatePDF(audit, responses) {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: `Audit Report - ${audit.title}`,
          Author: 'Aurora Audit Platform',
          Subject: 'Audit Report',
          Keywords: 'audit, compliance, inspection'
        }
      });

      // Collect PDF data
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Add header with logo
      addHeader(doc, audit);

      // Add title and metadata
      doc.fontSize(24)
         .fillColor('#1E40AF')
         .text(audit.title, { align: 'center' });
      
      doc.moveDown();
      
      // Audit information section
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`Status: ${formatStatus(audit.status)}`)
         .text(`Department: ${audit.department || 'N/A'}`)
         .text(`Location: ${audit.location || 'N/A'}`)
         .text(`Assigned To: ${audit.assignedTo || 'N/A'}`)
         .text(`Due Date: ${formatDate(audit.dueDate)}`)
         .text(`Created: ${formatDate(audit.createdAt)}`)
         .text(`Last Updated: ${formatDate(audit.updatedAt)}`);

      doc.moveDown(2);

      // Add description if exists
      if (audit.description) {
        doc.fontSize(14)
           .fillColor('#1E40AF')
           .text('Description', { underline: true });
        
        doc.fontSize(11)
           .fillColor('#374151')
           .text(audit.description);
        
        doc.moveDown();
      }

      // Progress summary
      addProgressSection(doc, audit);

      // Add page break
      doc.addPage();

      // Questions and Responses section
      doc.fontSize(18)
         .fillColor('#1E40AF')
         .text('Questions and Responses', { align: 'center' });
      
      doc.moveDown();

      // Group responses by category
      const groupedResponses = groupResponsesByCategory(responses);

      // Add each category
      Object.entries(groupedResponses).forEach(([category, categoryResponses]) => {
        // Category header
        doc.fontSize(14)
           .fillColor('#2563EB')
           .text(category, { underline: true });
        
        doc.moveDown(0.5);

        // Add questions and answers
        categoryResponses.forEach((response, index) => {
          const question = response.questions;
          
          // Question number and text
          doc.fontSize(11)
             .fillColor('#111827')
             .text(`${index + 1}. ${question.text}`);
          
          // Answer
          doc.fontSize(10)
             .fillColor('#6B7280')
             .text(`Answer: ${formatAnswer(response.answer, question.type)}`, {
               indent: 20
             });
          
          // Add attachments note if exists
          if (response.attachments && response.attachments.length > 0) {
            doc.fillColor('#3B82F6')
               .text(`📎 ${response.attachments.length} attachment(s)`, {
                 indent: 20
               });
          }
          
          doc.moveDown(0.5);
        });
        
        doc.moveDown();
      });

      // Add summary statistics
      addSummarySection(doc, audit, responses);

      // Add footer to all pages
      addFooter(doc);

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addHeader(doc, audit) {
  // Add company logo placeholder
  doc.rect(50, 40, 60, 60)
     .fillColor('#E5E7EB')
     .fill();
  
  // Add company name
  doc.fontSize(16)
     .fillColor('#1E40AF')
     .text('Aurora Audit Platform', 130, 50);
  
  doc.fontSize(10)
     .fillColor('#6B7280')
     .text('Professional Audit Report', 130, 70)
     .text(`Report ID: ${audit.id}`, 130, 85);
  
  // Add report date
  doc.fontSize(10)
     .fillColor('#6B7280')
     .text(`Generated: ${new Date().toLocaleDateString()}`, 400, 50, {
       align: 'right'
     });
  
  // Add separator line
  doc.moveTo(50, 110)
     .lineTo(545, 110)
     .strokeColor('#E5E7EB')
     .stroke();
  
  doc.moveDown(3);
}

function addProgressSection(doc, audit) {
  doc.fontSize(14)
     .fillColor('#1E40AF')
     .text('Progress Overview', { underline: true });
  
  doc.moveDown(0.5);
  
  // Calculate progress
  const progress = audit.progress || 0;
  const completed = audit.questionsCompleted || 0;
  const total = audit.totalQuestions || 0;
  
  // Progress text
  doc.fontSize(11)
     .fillColor('#374151')
     .text(`Completion: ${progress}% (${completed} of ${total} questions)`);
  
  // Draw progress bar
  const barWidth = 200;
  const barHeight = 20;
  const barX = 50;
  const barY = doc.y + 10;
  
  // Background
  doc.rect(barX, barY, barWidth, barHeight)
     .fillColor('#E5E7EB')
     .fill();
  
  // Progress fill
  const progressWidth = (barWidth * progress) / 100;
  doc.rect(barX, barY, progressWidth, barHeight)
     .fillColor(progress === 100 ? '#10B981' : '#3B82F6')
     .fill();
  
  // Progress text overlay
  doc.fillColor('#FFFFFF')
     .fontSize(10)
     .text(`${progress}%`, barX + barWidth / 2 - 15, barY + 5);
  
  doc.moveDown(3);
}

function addSummarySection(doc, audit, responses) {
  // Check if we need a new page
  if (doc.y > 600) {
    doc.addPage();
  }
  
  doc.fontSize(14)
     .fillColor('#1E40AF')
     .text('Summary Statistics', { underline: true });
  
  doc.moveDown(0.5);
  
  // Calculate statistics
  const totalQuestions = responses.length;
  const answeredQuestions = responses.filter(r => r.answer !== null).length;
  const unansweredQuestions = totalQuestions - answeredQuestions;
  const withAttachments = responses.filter(r => r.attachments && r.attachments.length > 0).length;
  
  doc.fontSize(11)
     .fillColor('#374151')
     .text(`Total Questions: ${totalQuestions}`)
     .text(`Answered: ${answeredQuestions}`)
     .text(`Unanswered: ${unansweredQuestions}`)
     .text(`With Attachments: ${withAttachments}`);
  
  doc.moveDown();
  
  // Add signature section
  doc.fontSize(12)
     .fillColor('#1E40AF')
     .text('Certification', { underline: true });
  
  doc.moveDown(0.5);
  
  doc.fontSize(10)
     .fillColor('#374151')
     .text('I certify that the information provided in this audit report is accurate and complete to the best of my knowledge.');
  
  doc.moveDown(2);
  
  // Signature lines
  doc.moveTo(50, doc.y)
     .lineTo(250, doc.y)
     .strokeColor('#9CA3AF')
     .stroke();
  
  doc.fontSize(9)
     .fillColor('#6B7280')
     .text('Auditor Signature', 50, doc.y + 5);
  
  doc.moveTo(295, doc.y - 20)
     .lineTo(495, doc.y - 20)
     .strokeColor('#9CA3AF')
     .stroke();
  
  doc.text('Date', 295, doc.y - 15);
}

function addFooter(doc) {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    
    // Footer line
    doc.moveTo(50, 750)
       .lineTo(545, 750)
       .strokeColor('#E5E7EB')
       .stroke();
    
    // Footer text
    doc.fontSize(9)
       .fillColor('#9CA3AF')
       .text(
         `Page ${i + 1} of ${pages.count}`,
         50,
         760,
         { align: 'center' }
       );
    
    doc.text(
      '© 2025 Aurora Audit Platform - Confidential',
      50,
      775,
      { align: 'center' }
    );
  }
}

function groupResponsesByCategory(responses) {
  const grouped = {};
  
  responses.forEach(response => {
    const category = response.questions?.category || 'General';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(response);
  });
  
  return grouped;
}

function formatStatus(status) {
  const statusMap = {
    'draft': 'Draft',
    'in_progress': 'In Progress',
    'completed': 'Completed',
    'archived': 'Archived'
  };
  return statusMap[status] || status;
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatAnswer(answer, type) {
  if (answer === null || answer === undefined) {
    return 'Not answered';
  }
  
  switch (type) {
    case 'boolean':
      return answer ? 'Yes' : 'No';
    case 'date':
      return formatDate(answer);
    case 'number':
      return answer.toString();
    case 'select':
    case 'multiselect':
      return Array.isArray(answer) ? answer.join(', ') : answer;
    case 'file':
      return 'See attachments';
    default:
      return answer.toString();
  }
}