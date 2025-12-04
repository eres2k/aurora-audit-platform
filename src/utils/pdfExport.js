import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

const COLORS = {
  primary: [255, 153, 0], // Amazon Orange
  success: [16, 185, 129], // Emerald
  warning: [245, 158, 11], // Amber
  danger: [239, 68, 68], // Red
  text: [30, 41, 59], // Slate 800
  textLight: [100, 116, 139], // Slate 500
  border: [226, 232, 240], // Slate 200
};

const getGrade = (score) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

const getScoreColor = (score) => {
  if (score >= 80) return COLORS.success;
  if (score >= 60) return COLORS.warning;
  return COLORS.danger;
};

const getAnswerDisplay = (answer, type) => {
  if (type === 'bool') {
    if (answer === 'pass') return { text: 'PASS', color: COLORS.success };
    if (answer === 'fail') return { text: 'FAIL', color: COLORS.danger };
    if (answer === 'na') return { text: 'N/A', color: COLORS.textLight };
    return { text: '-', color: COLORS.textLight };
  }
  if (type === 'rating') {
    return { text: answer ? `${answer}/5` : '-', color: COLORS.text };
  }
  return { text: answer || '-', color: COLORS.text };
};

export const generateAuditPDF = (audit, template, actions = [], options = {}) => {
  const { includeAIInsights = false, aiInsights = null } = options;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

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
  doc.text(template?.title || audit.templateTitle || 'Audit Report', margin, yPos);
  yPos += 10;

  // Score Badge
  if (audit.score !== null && audit.score !== undefined) {
    const scoreColor = getScoreColor(audit.score);
    const grade = getGrade(audit.score);

    // Score box
    doc.setFillColor(...scoreColor);
    doc.roundedRect(margin, yPos, 45, 25, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(grade, margin + 12, yPos + 17);

    doc.setFontSize(10);
    doc.text(`${audit.score}%`, margin + 25, yPos + 17);

    // Status
    doc.setTextColor(...COLORS.success);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPLETED', margin + 55, yPos + 12);

    doc.setTextColor(...COLORS.textLight);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(format(new Date(audit.completedAt || audit.date), 'MMM d, yyyy h:mm a'), margin + 55, yPos + 20);

    yPos += 35;
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
  doc.text(template?.category || 'General', col1X, yPos + 33);

  yPos += 45;

  // Sections and Questions
  if (template?.sections) {
    template.sections.forEach((section, sectionIndex) => {
      checkPageBreak(40);

      // Section Header
      doc.setFillColor(...COLORS.primary);
      doc.setDrawColor(...COLORS.primary);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 2, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${sectionIndex + 1}. ${section.title}`, margin + 5, yPos + 7);

      yPos += 15;

      // Questions table
      const tableData = section.items.map((item, idx) => {
        const answer = audit.answers?.[item.id];
        const answerDisplay = getAnswerDisplay(answer, item.type);
        const note = audit.notes?.[item.id];
        const photoCount = audit.questionPhotos?.[item.id]?.length || 0;

        return [
          `${idx + 1}`,
          item.text,
          item.critical ? 'Yes' : '',
          answerDisplay.text,
          note || '',
          photoCount > 0 ? `${photoCount} photo${photoCount > 1 ? 's' : ''}` : '',
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Question', 'Critical', 'Result', 'Comments / Observations', 'Evidence']],
        body: tableData,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: COLORS.text,
          lineColor: COLORS.border,
          lineWidth: 0.1,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: [241, 245, 249], // Slate 100
          textColor: COLORS.textLight,
          fontStyle: 'bold',
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 50, overflow: 'linebreak' },
          2: { cellWidth: 12, halign: 'center' },
          3: { cellWidth: 14, halign: 'center' },
          4: { cellWidth: 60, overflow: 'linebreak' }, // Much wider comments field
          5: { cellWidth: 18, halign: 'center' },
        },
        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index === 3) {
            const value = data.cell.raw;
            if (value === 'PASS') {
              data.cell.styles.textColor = COLORS.success;
              data.cell.styles.fontStyle = 'bold';
            } else if (value === 'FAIL') {
              data.cell.styles.textColor = COLORS.danger;
              data.cell.styles.fontStyle = 'bold';
            }
          }
          if (data.section === 'body' && data.column.index === 2 && data.cell.raw === 'Yes') {
            data.cell.styles.textColor = COLORS.danger;
            data.cell.styles.fontStyle = 'bold';
          }
          if (data.section === 'body' && data.column.index === 5 && data.cell.raw) {
            data.cell.styles.textColor = COLORS.primary;
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Add photos for this section if any
      section.items.forEach((item) => {
        const photos = audit.questionPhotos?.[item.id] || [];
        if (photos.length > 0) {
          checkPageBreak(60);

          doc.setTextColor(...COLORS.textLight);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(`Photos for: ${item.text.substring(0, 50)}${item.text.length > 50 ? '...' : ''}`, margin, yPos);
          yPos += 5;

          // Add photos in a row
          const photoWidth = 40;
          const photoHeight = 30;
          let xPos = margin;

          photos.forEach((photo, idx) => {
            if (xPos + photoWidth > pageWidth - margin) {
              xPos = margin;
              yPos += photoHeight + 5;
              checkPageBreak(photoHeight + 10);
            }

            try {
              doc.addImage(photo, 'JPEG', xPos, yPos, photoWidth, photoHeight);
            } catch (e) {
              // If image fails to load, draw a placeholder
              doc.setDrawColor(...COLORS.border);
              doc.setFillColor(248, 250, 252);
              doc.roundedRect(xPos, yPos, photoWidth, photoHeight, 2, 2, 'FD');
              doc.setTextColor(...COLORS.textLight);
              doc.setFontSize(7);
              doc.text(`Photo ${idx + 1}`, xPos + photoWidth/2, yPos + photoHeight/2, { align: 'center' });
            }

            xPos += photoWidth + 5;
          });

          yPos += photoHeight + 10;
        }
      });
    });
  }

  // Actions Section
  const auditActions = actions.filter(a => a.auditId === audit.id);
  if (auditActions.length > 0) {
    checkPageBreak(50);

    // Actions Header
    doc.setFillColor(...COLORS.danger);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Actions (${auditActions.length})`, margin + 5, yPos + 7);

    yPos += 15;

    // Actions table
    const actionTableData = auditActions.map((action, idx) => [
      `${idx + 1}`,
      action.questionText || action.title || 'Action',
      action.priority?.toUpperCase() || 'MEDIUM',
      action.status?.replace('_', ' ')?.toUpperCase() || 'OPEN',
      action.notes || action.description || '',
      action.dueDate ? format(new Date(action.dueDate), 'MMM d, yyyy') : '',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'Issue', 'Priority', 'Status', 'Notes', 'Due Date']],
      body: actionTableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: COLORS.text,
        lineColor: COLORS.border,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [254, 226, 226], // Red 100
        textColor: COLORS.danger,
        fontStyle: 'bold',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 35 },
        5: { cellWidth: 25, halign: 'center' },
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
            data.cell.styles.textColor = [59, 130, 246]; // Blue 500
            data.cell.styles.fontStyle = 'bold';
          }
        }
        if (data.section === 'body' && data.column.index === 3) {
          const value = data.cell.raw;
          if (value === 'COMPLETED') {
            data.cell.styles.textColor = COLORS.success;
          } else if (value === 'IN PROGRESS') {
            data.cell.styles.textColor = COLORS.warning;
          } else {
            data.cell.styles.textColor = COLORS.danger;
          }
        }
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Global Notes
  if (audit.globalNotes) {
    checkPageBreak(50);

    doc.setFillColor(248, 250, 252);
    const notesHeight = Math.max(40, 30 + audit.globalNotes.length / 3);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, notesHeight, 3, 3, 'F');

    doc.setTextColor(...COLORS.textLight);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('ADDITIONAL NOTES', margin + 8, yPos + 12);

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(audit.globalNotes, pageWidth - 2 * margin - 16);
    doc.text(splitNotes, margin + 8, yPos + 22);

    yPos += notesHeight + 10;
  }

  // AI Audit Insights Section
  if (includeAIInsights && aiInsights) {
    checkPageBreak(80);

    // AI Insights Header
    doc.setFillColor(79, 70, 229); // Indigo
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 12, 3, 3, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Audit Insights', margin + 8, yPos + 8);

    // AI badge
    doc.setFillColor(167, 139, 250); // Purple 400
    doc.roundedRect(pageWidth - margin - 25, yPos + 2, 20, 8, 2, 2, 'F');
    doc.setFontSize(7);
    doc.text('AI', pageWidth - margin - 15, yPos + 7.5, { align: 'center' });

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

    // AI Disclaimer
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 16, 2, 2, 'F');
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Note: AI insights are generated automatically and should be reviewed by qualified personnel.', margin + 5, yPos + 6);
    doc.text('Always verify recommendations against current safety regulations and standards.', margin + 5, yPos + 12);

    yPos += 25;
  }

  // Signature
  if (audit.signature) {
    checkPageBreak(50);

    doc.setTextColor(...COLORS.textLight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('AUDITOR SIGNATURE', margin, yPos + 5);

    try {
      doc.addImage(audit.signature, 'PNG', margin, yPos + 10, 60, 30);
    } catch (e) {
      doc.setTextColor(...COLORS.text);
      doc.setFontSize(9);
      doc.text('[Signature on file]', margin, yPos + 25);
    }

    doc.setDrawColor(...COLORS.border);
    doc.line(margin, yPos + 42, margin + 70, yPos + 42);

    doc.setTextColor(...COLORS.textLight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(audit.createdBy || 'Auditor', margin, yPos + 50);
    doc.text(format(new Date(audit.completedAt || audit.date), 'MMM d, yyyy'), margin + 50, yPos + 50);
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
  const templateName = (template?.title || audit.templateTitle || 'Audit').replace(/[^a-zA-Z0-9]/g, '_');
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
