import { Handler } from '@netlify/functions';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { audit } = JSON.parse(event.body || '{}');
    
    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Add content
    page.drawText(`Audit Report: ${audit.title}`, {
      x: 50,
      y: page.getHeight() - 50,
      size: 20,
      font,
      color: rgb(0, 0, 0),
    });
    
    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="audit-${audit.id}.pdf"`,
      },
      body: Buffer.from(pdfBytes).toString('base64'),
      isBase64Encoded: true,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'PDF generation failed' }),
    };
  }
};
