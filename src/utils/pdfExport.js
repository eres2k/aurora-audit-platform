import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const COLORS = {
  primary: [255, 153, 0], // Amazon Orange
  primaryDark: [232, 119, 0], // Darker orange
  success: [16, 185, 129], // Emerald
  successLight: [209, 250, 229], // Emerald 100
  warning: [245, 158, 11], // Amber
  warningLight: [254, 243, 199], // Amber 100
  danger: [239, 68, 68], // Red
  dangerLight: [254, 226, 226], // Red 100
  text: [30, 41, 59], // Slate 800
  textLight: [100, 116, 139], // Slate 500
  textMuted: [148, 163, 184], // Slate 400
  border: [226, 232, 240], // Slate 200
  background: [248, 250, 252], // Slate 50
  white: [255, 255, 255],
  indigo: [79, 70, 229],
  indigoLight: [238, 242, 255],
};

const getScoreColor = (score) => {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.warning;
  return COLORS.danger;
};

// Draw a checkmark icon
const drawCheckIcon = (doc, x, y, size, color) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.8);
  // Draw checkmark
  doc.line(x, y, x + size * 0.35, y + size * 0.35);
  doc.line(x + size * 0.35, y + size * 0.35, x + size, y - size * 0.3);
};

// Draw an X icon
const drawXIcon = (doc, x, y, size, color) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.8);
  const half = size / 2;
  doc.line(x - half, y - half, x + half, y + half);
  doc.line(x - half, y + half, x + half, y - half);
};

// Draw a warning triangle icon
const drawWarningIcon = (doc, x, y, size, color) => {
  doc.setDrawColor(...color);
  doc.setFillColor(...color);
  doc.setLineWidth(0.5);
  // Triangle
  const h = size * 0.9;
  const w = size;
  doc.triangle(x, y - h/2, x - w/2, y + h/2, x + w/2, y + h/2, 'FD');
  // Exclamation mark
  doc.setFillColor(255, 255, 255);
  doc.circle(x, y + h/4, size * 0.08, 'F');
  doc.rect(x - size * 0.06, y - h/4, size * 0.12, h * 0.35, 'F');
};

// Draw a circle with status color
const drawStatusCircle = (doc, x, y, radius, fillColor, borderColor = null) => {
  doc.setFillColor(...fillColor);
  if (borderColor) {
    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.circle(x, y, radius, 'FD');
  } else {
    doc.circle(x, y, radius, 'F');
  }
};

// Draw a badge-style indicator
const drawBadge = (doc, x, y, text, bgColor, textColor, width = null) => {
  doc.setFontSize(7);
  const textWidth = width || doc.getTextWidth(text) + 6;
  const height = 5;

  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y - height/2 - 1, textWidth, height, 1.5, 1.5, 'F');

  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(text, x + textWidth/2, y, { align: 'center' });
};

const getAnswerDisplay = (answer, type) => {
  if (type === 'bool') {
    if (answer === 'pass') return { text: 'PASS', color: COLORS.success, bgColor: COLORS.successLight, status: 'pass' };
    if (answer === 'fail') return { text: 'FAIL', color: COLORS.danger, bgColor: COLORS.dangerLight, status: 'fail' };
    if (answer === 'na') return { text: 'N/A', color: COLORS.textMuted, bgColor: COLORS.border, status: 'na' };
    return { text: '-', color: COLORS.textMuted, bgColor: COLORS.border, status: 'none' };
  }
  if (type === 'rating') {
    const rating = parseInt(answer) || 0;
    const color = rating >= 4 ? COLORS.success : rating >= 3 ? COLORS.warning : rating > 0 ? COLORS.danger : COLORS.textMuted;
    return { text: answer ? `${answer}/5` : '-', color, bgColor: COLORS.background, status: 'rating' };
  }
  return { text: answer || '-', color: COLORS.text, bgColor: COLORS.background, status: 'text' };
};

export const generateAuditPDF = (audit, template, actions = [], options = {}) => {
  const { includeAIInsights = false, aiInsights = null, includeActions = true } = options;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Use stored template sections from audit if template is not available
  // This ensures PDF export works for all users viewing the audit
  const effectiveTemplate = template || (audit?.templateSections ? {
    id: audit.templateId,
    title: audit.templateTitle,
    category: audit.templateCategory || 'General',
    sections: audit.templateSections,
  } : null);

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace = 30) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Professional Header with gradient effect
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Secondary accent bar
  doc.setFillColor(232, 119, 0); // Darker orange
  doc.rect(0, 40, pageWidth, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AuditHub', margin, 20);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Safety Audit Report', margin, 30);

  // Report metadata on the right
  doc.setFontSize(9);
  doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`Report ID: ${audit.id.slice(-8).toUpperCase()}`, pageWidth - margin, 28, { align: 'right' });
  if (audit.createdBy) {
    doc.text(`Auditor: ${audit.createdBy}`, pageWidth - margin, 38, { align: 'right' });
  }

  yPos = 55;

  // Audit Title
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(effectiveTemplate?.title || audit.templateTitle || 'Audit Report', margin, yPos);
  yPos += 10;

  // Score Badge - circular design with color coding
  if (audit.score !== null && audit.score !== undefined) {
    const scoreColor = getScoreColor(audit.score);
    const circleRadius = 18;
    const circleX = margin + circleRadius + 5;
    const circleY = yPos + circleRadius + 2;

    // Draw colored circle background
    doc.setFillColor(...scoreColor);
    doc.circle(circleX, circleY, circleRadius, 'F');

    // Inner white circle for ring effect
    doc.setFillColor(255, 255, 255);
    doc.circle(circleX, circleY, circleRadius - 4, 'F');

    // Score percentage in the center
    doc.setTextColor(...scoreColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${audit.score}%`, circleX, circleY + 2, { align: 'center' });

    // Status and completion date
    doc.setTextColor(...COLORS.success);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPLETED', margin + 55, yPos + 15);

    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(format(new Date(audit.completedAt || audit.date), 'MMM d, yyyy h:mm a'), margin + 55, yPos + 24);

    yPos += 45;
  }

  // Audit Details Box
  doc.setDrawColor(...COLORS.border);
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 35, 2, 2, 'FD');

  doc.setTextColor(...COLORS.textLight);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  const col1X = margin + 5;
  const col2X = pageWidth / 3;
  const col3X = (pageWidth / 3) * 2;

  doc.text('AUDITOR', col1X, yPos + 8);
  doc.text('LOCATION', col2X, yPos + 8);
  doc.text('DATE', col3X, yPos + 8);

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(audit.createdBy || 'Unknown', col1X, yPos + 18);
  doc.text(audit.location || 'Not specified', col2X, yPos + 18);
  doc.text(format(new Date(audit.date), 'MMM d, yyyy'), col3X, yPos + 18);

  doc.setTextColor(...COLORS.textLight);
  doc.setFontSize(8);
  doc.text('TEMPLATE', col1X, yPos + 26);
  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.text(effectiveTemplate?.category || audit.templateCategory || 'General', col1X, yPos + 33);

  yPos += 45;

  // Sections and Questions - Card-based professional layout
  if (effectiveTemplate?.sections) {
    effectiveTemplate.sections.forEach((section, sectionIndex) => {
      checkPageBreak(40);

      // Section Header with icon indicator
      doc.setFillColor(...COLORS.primary);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 3, 3, 'F');

      // Section number badge
      doc.setFillColor(...COLORS.primaryDark);
      doc.circle(margin + 10, yPos + 6, 5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`${sectionIndex + 1}`, margin + 10, yPos + 7.5, { align: 'center' });

      // Section title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, margin + 20, yPos + 8);

      // Section stats on the right
      const sectionPassed = section.items.filter(item => audit.answers?.[item.id] === 'pass').length;
      const sectionFailed = section.items.filter(item => audit.answers?.[item.id] === 'fail').length;
      const sectionTotal = section.items.length;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`${sectionPassed}/${sectionTotal} passed`, pageWidth - margin - 5, yPos + 8, { align: 'right' });

      yPos += 18;

      // Questions as individual cards
      section.items.forEach((item, idx) => {
        const answer = audit.answers?.[item.id];
        const answerDisplay = getAnswerDisplay(answer, item.type);
        const note = audit.notes?.[item.id];
        const photos = audit.questionPhotos?.[item.id] || [];

        // Calculate card height
        doc.setFontSize(9);
        const questionLines = doc.splitTextToSize(item.text, pageWidth - 2 * margin - 50);
        let cardHeight = 16 + (questionLines.length - 1) * 4;
        if (note) {
          const noteLines = doc.splitTextToSize(note, pageWidth - 2 * margin - 20);
          cardHeight += 8 + noteLines.length * 4;
        }
        if (photos.length > 0) {
          cardHeight += 8; // Just space for the photo count badge
        }
        cardHeight = Math.max(cardHeight, 18);

        checkPageBreak(cardHeight + 5);

        // Card background - colored based on status
        const cardBgColor = answerDisplay.status === 'fail' ? COLORS.dangerLight : COLORS.background;
        doc.setFillColor(...cardBgColor);
        doc.setDrawColor(...COLORS.border);
        doc.setLineWidth(0.2);
        doc.roundedRect(margin, yPos, pageWidth - 2 * margin, cardHeight, 2, 2, 'FD');

        // Left status indicator bar
        const statusBarColor = answerDisplay.status === 'pass' ? COLORS.success :
                               answerDisplay.status === 'fail' ? COLORS.danger :
                               COLORS.textMuted;
        doc.setFillColor(...statusBarColor);
        doc.roundedRect(margin, yPos, 3, cardHeight, 2, 0, 'F');
        doc.rect(margin + 1, yPos, 2, cardHeight, 'F'); // Fill in rounded corner

        // Question number
        doc.setTextColor(...COLORS.textMuted);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(`${idx + 1}`, margin + 8, yPos + 6);

        // Critical badge if applicable
        let questionStartX = margin + 15;
        if (item.critical) {
          doc.setFillColor(...COLORS.danger);
          doc.roundedRect(margin + 15, yPos + 2.5, 16, 5, 1.5, 1.5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6);
          doc.setFont('helvetica', 'bold');
          doc.text('CRITICAL', margin + 23, yPos + 6, { align: 'center' });
          questionStartX = margin + 34;
        }

        // Question text
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const maxQuestionWidth = pageWidth - questionStartX - 35;
        const wrappedQuestion = doc.splitTextToSize(item.text, maxQuestionWidth);
        doc.text(wrappedQuestion, questionStartX, yPos + 6);

        // Status indicator on the right with icon
        const statusX = pageWidth - margin - 22;
        const statusY = yPos + 8;

        // Status circle background
        drawStatusCircle(doc, statusX + 8, statusY - 2, 6, answerDisplay.bgColor, statusBarColor);

        // Status icon inside circle
        if (answerDisplay.status === 'pass') {
          drawCheckIcon(doc, statusX + 5, statusY - 2, 4, COLORS.success);
        } else if (answerDisplay.status === 'fail') {
          drawXIcon(doc, statusX + 8, statusY - 2, 3, COLORS.danger);
        } else if (answerDisplay.status === 'na') {
          doc.setTextColor(...COLORS.textMuted);
          doc.setFontSize(6);
          doc.setFont('helvetica', 'bold');
          doc.text('N/A', statusX + 8, statusY - 1, { align: 'center' });
        } else if (answerDisplay.status === 'rating') {
          doc.setTextColor(...answerDisplay.color);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text(answerDisplay.text, statusX + 8, statusY - 1, { align: 'center' });
        }

        // Status text label
        doc.setTextColor(...answerDisplay.color);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        if (answerDisplay.status === 'pass' || answerDisplay.status === 'fail') {
          doc.text(answerDisplay.text, statusX + 8, statusY + 5, { align: 'center' });
        }

        let contentY = yPos + 8 + (wrappedQuestion.length - 1) * 4;

        // Notes/observations if present
        if (note) {
          contentY += 5;
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(...COLORS.border);
          const noteLines = doc.splitTextToSize(note, pageWidth - 2 * margin - 24);
          const noteBoxHeight = 6 + noteLines.length * 4;
          doc.roundedRect(margin + 8, contentY, pageWidth - 2 * margin - 16, noteBoxHeight, 1.5, 1.5, 'FD');

          doc.setTextColor(...COLORS.textLight);
          doc.setFontSize(6);
          doc.setFont('helvetica', 'bold');
          doc.text('NOTE:', margin + 11, contentY + 4);

          doc.setTextColor(...COLORS.text);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.text(noteLines, margin + 24, contentY + 4);

          contentY += noteBoxHeight;
        }

        // Photo count indicator
        if (photos.length > 0) {
          contentY += 3;
          doc.setFillColor(...COLORS.primary);
          doc.roundedRect(margin + 8, contentY, 22, 5, 1.5, 1.5, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(6);
          doc.setFont('helvetica', 'bold');
          doc.text(`${photos.length} PHOTO${photos.length > 1 ? 'S' : ''}`, margin + 19, contentY + 3.5, { align: 'center' });
        }

        yPos += cardHeight + 3;
      });

      // Add photos for this section in a grid after all questions
      const sectionPhotos = [];
      section.items.forEach((item) => {
        const photos = audit.questionPhotos?.[item.id] || [];
        if (photos.length > 0) {
          sectionPhotos.push({ item, photos });
        }
      });

      if (sectionPhotos.length > 0) {
        yPos += 5;
        checkPageBreak(50);

        doc.setTextColor(...COLORS.textLight);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`Evidence Photos - ${section.title}`, margin, yPos);
        yPos += 7;

        sectionPhotos.forEach(({ item, photos }) => {
          checkPageBreak(45);

          // Item reference
          doc.setTextColor(...COLORS.text);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'normal');
          const shortText = item.text.length > 60 ? item.text.substring(0, 60) + '...' : item.text;
          doc.text(shortText, margin, yPos);
          yPos += 4;

          // Photos in a row
          const photoWidth = 35;
          const photoHeight = 26;
          let xPos = margin;

          photos.forEach((photo, photoIdx) => {
            if (xPos + photoWidth > pageWidth - margin) {
              xPos = margin;
              yPos += photoHeight + 4;
              checkPageBreak(photoHeight + 8);
            }

            try {
              // Photo frame
              doc.setDrawColor(...COLORS.border);
              doc.setLineWidth(0.3);
              doc.roundedRect(xPos - 1, yPos - 1, photoWidth + 2, photoHeight + 2, 2, 2, 'D');
              doc.addImage(photo, 'JPEG', xPos, yPos, photoWidth, photoHeight);
            } catch (e) {
              doc.setFillColor(...COLORS.background);
              doc.roundedRect(xPos, yPos, photoWidth, photoHeight, 2, 2, 'FD');
              doc.setTextColor(...COLORS.textMuted);
              doc.setFontSize(7);
              doc.text(`Photo ${photoIdx + 1}`, xPos + photoWidth/2, yPos + photoHeight/2, { align: 'center' });
            }

            xPos += photoWidth + 4;
          });

          yPos += photoHeight + 6;
        });
      }

      yPos += 8;
    });
  }

  // Actions Section - only show if includeActions is true
  const auditActions = actions.filter(a => a.auditId === audit.id);
  if (includeActions && auditActions.length > 0) {
    checkPageBreak(50);

    // Actions Header with icon
    doc.setFillColor(...COLORS.danger);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 3, 3, 'F');

    // Action icon (clipboard)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin + 6, yPos + 3, 6, 6, 1, 1, 'F');
    doc.setFillColor(...COLORS.danger);
    doc.rect(margin + 7, yPos + 4, 4, 0.8, 'F');
    doc.rect(margin + 7, yPos + 6, 3, 0.8, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Corrective Actions', margin + 16, yPos + 8);

    // Count badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - margin - 22, yPos + 3, 18, 6, 2, 2, 'F');
    doc.setTextColor(...COLORS.danger);
    doc.setFontSize(8);
    doc.text(`${auditActions.length} item${auditActions.length > 1 ? 's' : ''}`, pageWidth - margin - 13, yPos + 7, { align: 'center' });

    yPos += 18;

    // Actions as cards instead of table
    auditActions.forEach((action, idx) => {
      const actionNote = action.notes || action.description || '';
      doc.setFontSize(8);
      const noteLines = actionNote ? doc.splitTextToSize(actionNote, pageWidth - 2 * margin - 60) : [];
      const cardHeight = Math.max(22, 14 + noteLines.length * 4);

      checkPageBreak(cardHeight + 5);

      // Card background
      const priorityBgColor = action.priority === 'high' ? COLORS.dangerLight :
                              action.priority === 'medium' ? COLORS.warningLight :
                              COLORS.background;
      doc.setFillColor(...priorityBgColor);
      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.2);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, cardHeight, 2, 2, 'FD');

      // Priority indicator bar
      const priorityColor = action.priority === 'high' ? COLORS.danger :
                            action.priority === 'medium' ? COLORS.warning :
                            [59, 130, 246]; // Blue
      doc.setFillColor(...priorityColor);
      doc.roundedRect(margin, yPos, 3, cardHeight, 2, 0, 'F');
      doc.rect(margin + 1, yPos, 2, cardHeight, 'F');

      // Number
      doc.setTextColor(...COLORS.textMuted);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(`${idx + 1}`, margin + 8, yPos + 6);

      // Priority badge
      doc.setFillColor(...priorityColor);
      const priorityText = (action.priority || 'medium').toUpperCase();
      doc.roundedRect(margin + 15, yPos + 2.5, 14, 5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text(priorityText, margin + 22, yPos + 6, { align: 'center' });

      // Status badge
      const statusColor = action.status === 'completed' ? COLORS.success :
                          action.status === 'in_progress' ? COLORS.warning :
                          COLORS.danger;
      const statusText = action.status?.replace('_', ' ')?.toUpperCase() || 'OPEN';
      doc.setFillColor(...statusColor);
      doc.roundedRect(margin + 32, yPos + 2.5, 18, 5, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(5);
      doc.text(statusText, margin + 41, yPos + 6, { align: 'center' });

      // Issue text
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const issueText = action.questionText || action.title || 'Action item';
      const maxIssueWidth = pageWidth - margin - 85;
      const issueLines = doc.splitTextToSize(issueText, maxIssueWidth);
      doc.text(issueLines[0], margin + 54, yPos + 6);

      // Due date on the right
      if (action.dueDate) {
        doc.setTextColor(...COLORS.textLight);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(`Due: ${format(new Date(action.dueDate), 'MMM d')}`, pageWidth - margin - 5, yPos + 6, { align: 'right' });
      }

      // Notes if present
      if (noteLines.length > 0) {
        doc.setTextColor(...COLORS.textLight);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(noteLines, margin + 8, yPos + 14);
      }

      yPos += cardHeight + 3;
    });

    yPos += 5;
  }

  // Global Notes
  if (audit.globalNotes) {
    checkPageBreak(50);

    // Calculate actual height needed
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(audit.globalNotes, pageWidth - 2 * margin - 16);
    const notesHeight = Math.max(35, 22 + splitNotes.length * 5);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...COLORS.border);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, notesHeight, 3, 3, 'FD');

    doc.setTextColor(...COLORS.textLight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ADDITIONAL NOTES', margin + 8, yPos + 10);

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(splitNotes, margin + 8, yPos + 18);

    yPos += notesHeight + 10;
  }

  // Audit Insights Section
  if (includeAIInsights && aiInsights) {
    checkPageBreak(80);

    // Insights Header
    doc.setFillColor(79, 70, 229); // Indigo
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Audit Insights', margin + 8, yPos + 8);

    yPos += 18;

    // Summary Box
    if (aiInsights.summary) {
      doc.setFillColor(238, 242, 255); // Indigo 50
      doc.setDrawColor(199, 210, 254); // Indigo 200
      const summaryLines = doc.splitTextToSize(aiInsights.summary, pageWidth - 2 * margin - 16);
      const summaryHeight = 20 + summaryLines.length * 5;
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, summaryHeight, 3, 3, 'FD');

      doc.setTextColor(79, 70, 229);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', margin + 8, yPos + 10);

      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(summaryLines, margin + 8, yPos + 18);

      yPos += summaryHeight + 8;
    }

    // Key Findings
    if (aiInsights.keyFindings && aiInsights.keyFindings.length > 0) {
      checkPageBreak(50);

      doc.setTextColor(79, 70, 229);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Findings', margin, yPos);
      yPos += 6;

      aiInsights.keyFindings.forEach((finding, idx) => {
        const findingLines = doc.splitTextToSize(`${idx + 1}. ${finding}`, pageWidth - 2 * margin - 10);
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(findingLines, margin + 5, yPos);
        yPos += findingLines.length * 4 + 3;
      });

      yPos += 5;
    }

    // Recommendations
    if (aiInsights.recommendations && aiInsights.recommendations.length > 0) {
      checkPageBreak(50);

      doc.setTextColor(16, 185, 129); // Emerald
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', margin, yPos);
      yPos += 6;

      aiInsights.recommendations.forEach((rec, idx) => {
        const recLines = doc.splitTextToSize(`${idx + 1}. ${rec}`, pageWidth - 2 * margin - 10);
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(recLines, margin + 5, yPos);
        yPos += recLines.length * 4 + 3;
      });

      yPos += 5;
    }

    // Risk Areas
    if (aiInsights.riskAreas && aiInsights.riskAreas.length > 0) {
      checkPageBreak(50);

      doc.setTextColor(239, 68, 68); // Red
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Areas of Concern', margin, yPos);
      yPos += 6;

      aiInsights.riskAreas.forEach((risk, idx) => {
        const riskLines = doc.splitTextToSize(`${idx + 1}. ${risk}`, pageWidth - 2 * margin - 10);
        doc.setTextColor(...COLORS.text);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(riskLines, margin + 5, yPos);
        yPos += riskLines.length * 4 + 3;
      });

      yPos += 10;
    }

    // Disclaimer
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 16, 2, 2, 'F');
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Note: Insights are generated automatically and should be reviewed by qualified personnel.', margin + 5, yPos + 6);
    doc.text('Always verify recommendations against current safety regulations and standards.', margin + 5, yPos + 12);

    yPos += 25;
  }

  // Signature
  if (audit.signature) {
    checkPageBreak(60);

    doc.setTextColor(...COLORS.textLight);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('AUDITOR SIGNATURE', margin, yPos + 5);

    try {
      doc.addImage(audit.signature, 'PNG', margin, yPos + 12, 70, 35);
    } catch (e) {
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.text('[Signature on file]', margin, yPos + 30);
    }

    doc.setDrawColor(...COLORS.border);
    doc.line(margin, yPos + 50, margin + 80, yPos + 50);

    // Use signedBy field if available, fallback to createdBy for older audits
    const signerName = audit.signedBy || audit.createdBy || 'Auditor';
    doc.setTextColor(...COLORS.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(signerName, margin, yPos + 58);

    doc.setTextColor(...COLORS.textLight);
    doc.setFontSize(8);
    doc.text(format(new Date(audit.completedAt || audit.date), 'MMM d, yyyy'), margin, yPos + 66);
  }

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(...COLORS.textLight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Generated by AuditHub',
      margin,
      pageHeight - 10
    );
  }

  // Generate filename and save
  const auditDate = format(new Date(audit.date), 'yyyy-MM-dd');
  const templateName = (effectiveTemplate?.title || audit.templateTitle || 'Audit').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${templateName}_${audit.location || 'Station'}_${auditDate}.pdf`;

  doc.save(filename);

  return filename;
};

// Export actions to PDF
export const generateActionsPDF = (actions, stationFilter = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Filter actions if station specified
  const filteredActions = stationFilter
    ? actions.filter(a => a.location === stationFilter)
    : actions;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace = 30) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AuditHub', margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Actions Report', margin, 27);

  doc.setFontSize(9);
  doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, pageWidth - margin, 18, { align: 'right' });
  if (stationFilter) {
    doc.text(`Station: ${stationFilter}`, pageWidth - margin, 27, { align: 'right' });
  }

  yPos = 50;

  // Summary Stats
  const openCount = filteredActions.filter(a => a.status === 'open').length;
  const inProgressCount = filteredActions.filter(a => a.status === 'in_progress').length;
  const completedCount = filteredActions.filter(a => a.status === 'completed').length;
  const highPriorityCount = filteredActions.filter(a => a.priority === 'high').length;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Actions Summary', margin, yPos);
  yPos += 10;

  // Stats boxes
  const boxWidth = (pageWidth - 2 * margin - 15) / 4;

  // Open
  doc.setFillColor(...COLORS.danger);
  doc.roundedRect(margin, yPos, boxWidth, 25, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${openCount}`, margin + boxWidth/2, yPos + 12, { align: 'center' });
  doc.setFontSize(8);
  doc.text('OPEN', margin + boxWidth/2, yPos + 20, { align: 'center' });

  // In Progress
  doc.setFillColor(...COLORS.warning);
  doc.roundedRect(margin + boxWidth + 5, yPos, boxWidth, 25, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${inProgressCount}`, margin + boxWidth + 5 + boxWidth/2, yPos + 12, { align: 'center' });
  doc.setFontSize(8);
  doc.text('IN PROGRESS', margin + boxWidth + 5 + boxWidth/2, yPos + 20, { align: 'center' });

  // Completed
  doc.setFillColor(...COLORS.success);
  doc.roundedRect(margin + (boxWidth + 5) * 2, yPos, boxWidth, 25, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${completedCount}`, margin + (boxWidth + 5) * 2 + boxWidth/2, yPos + 12, { align: 'center' });
  doc.setFontSize(8);
  doc.text('COMPLETED', margin + (boxWidth + 5) * 2 + boxWidth/2, yPos + 20, { align: 'center' });

  // High Priority
  doc.setFillColor(239, 68, 68);
  doc.roundedRect(margin + (boxWidth + 5) * 3, yPos, boxWidth, 25, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`${highPriorityCount}`, margin + (boxWidth + 5) * 3 + boxWidth/2, yPos + 12, { align: 'center' });
  doc.setFontSize(8);
  doc.text('HIGH PRIORITY', margin + (boxWidth + 5) * 3 + boxWidth/2, yPos + 20, { align: 'center' });

  yPos += 35;

  // Group actions by status
  const statusGroups = [
    { status: 'open', label: 'Open Actions', color: COLORS.danger },
    { status: 'in_progress', label: 'In Progress', color: COLORS.warning },
    { status: 'completed', label: 'Completed Actions', color: COLORS.success },
  ];

  statusGroups.forEach(({ status, label, color }) => {
    const groupActions = filteredActions.filter(a => a.status === status);
    if (groupActions.length === 0) return;

    checkPageBreak(50);

    // Section header
    doc.setFillColor(...color);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label} (${groupActions.length})`, margin + 5, yPos + 7);

    yPos += 15;

    // Actions table
    const tableData = groupActions.map((action, idx) => [
      `${idx + 1}`,
      action.questionText || action.title || 'Action',
      action.priority?.toUpperCase() || 'MEDIUM',
      action.location || '-',
      action.notes || action.description || '',
      action.dueDate ? format(new Date(action.dueDate), 'MMM d') : '-',
      action.createdAt ? format(new Date(action.createdAt), 'MMM d') : '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Issue', 'Priority', 'Location', 'Notes', 'Due', 'Created']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 2,
        textColor: COLORS.text,
        lineColor: COLORS.border,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: COLORS.textLight,
        fontStyle: 'bold',
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 16, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 40 },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' },
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const value = data.cell.raw;
          if (value === 'HIGH') {
            data.cell.styles.textColor = COLORS.danger;
            data.cell.styles.fontStyle = 'bold';
          } else if (value === 'MEDIUM') {
            data.cell.styles.textColor = COLORS.warning;
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [59, 130, 246];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  });

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setTextColor(...COLORS.textLight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(
      'Generated by AuditHub',
      margin,
      pageHeight - 10
    );
  }

  // Generate filename and save
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const filename = stationFilter
    ? `Actions_${stationFilter}_${dateStr}.pdf`
    : `Actions_All_${dateStr}.pdf`;

  doc.save(filename);

  return filename;
};

export default generateAuditPDF;
