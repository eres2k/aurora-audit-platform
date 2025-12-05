import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

// Amazon Executive Style Colors
const COLORS = {
  amazonOrange: [255, 153, 0],
  amazonDark: [35, 47, 62],
  black: [0, 0, 0],
  white: [255, 255, 255],
  success: [0, 128, 0],
  warning: [204, 102, 0],
  danger: [204, 0, 0],
  gray100: [248, 249, 250],
  gray200: [233, 236, 239],
  gray400: [173, 181, 189],
  gray600: [108, 117, 125],
  gray800: [52, 58, 64],
  gray900: [33, 37, 41],
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
  if (type === 'bool' || type === 'yesno') {
    if (answer === 'pass') return { text: 'PASS', color: COLORS.success };
    if (answer === 'fail') return { text: 'FAIL', color: COLORS.danger };
    if (answer === 'na') return { text: 'N/A', color: COLORS.gray600 };
    return { text: '-', color: COLORS.gray600 };
  }
  if (type === 'rating') {
    return { text: answer ? `${answer}/5` : '-', color: COLORS.gray800 };
  }
  return { text: answer || '-', color: COLORS.gray800 };
};

// Helper to draw a divider line
const drawDivider = (doc, yPos, margin, pageWidth, color = COLORS.gray200) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
};

export const generateAuditPDF = (audit, template, actions = [], options = {}) => {
  const { includeAIInsights = false, aiInsights = null, includeActions = true } = options;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredSpace = 30) => {
    if (yPos + requiredSpace > pageHeight - 25) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // ============================================
  // EXECUTIVE HEADER - Clean, Minimal
  // ============================================

  // Top accent line (Amazon Orange)
  doc.setFillColor(...COLORS.amazonOrange);
  doc.rect(0, 0, pageWidth, 4, 'F');

  yPos = 20;

  // Company Name
  doc.setTextColor(...COLORS.amazonDark);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('AUDIT REPORT', margin, yPos);

  // Report ID and Date on the right
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray600);
  doc.text(`Report #${audit.shortId || audit.id.slice(-8).toUpperCase()}`, pageWidth - margin, yPos - 5, { align: 'right' });
  doc.text(format(new Date(), 'MMMM d, yyyy'), pageWidth - margin, yPos + 2, { align: 'right' });

  yPos += 10;

  // Audit Title
  doc.setTextColor(...COLORS.gray800);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const titleText = template?.title || audit.templateTitle || 'Safety Audit';
  doc.text(titleText, margin, yPos);

  yPos += 12;
  drawDivider(doc, yPos, margin, pageWidth, COLORS.gray200);
  yPos += 15;

  // ============================================
  // EXECUTIVE SUMMARY BOX
  // ============================================

  // Score Card - Prominent display
  const scoreBoxWidth = 50;
  const scoreBoxHeight = 45;
  const score = audit.score !== null && audit.score !== undefined ? audit.score : 0;
  const scoreColor = getScoreColor(score);
  const grade = getGrade(score);

  // Score Box
  doc.setFillColor(...COLORS.gray100);
  doc.roundedRect(margin, yPos, scoreBoxWidth, scoreBoxHeight, 3, 3, 'F');

  doc.setTextColor(...scoreColor);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(grade, margin + 15, yPos + 22);

  doc.setFontSize(11);
  doc.text(`${score}%`, margin + 30, yPos + 22);

  doc.setTextColor(...COLORS.gray600);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('SCORE', margin + scoreBoxWidth / 2, yPos + 38, { align: 'center' });

  // Key Metrics - Right side of score
  const metricsX = margin + scoreBoxWidth + 15;
  const metricsWidth = pageWidth - margin - metricsX;

  // Calculate stats
  let totalQuestions = 0;
  let passCount = 0;
  let failCount = 0;
  let naCount = 0;

  if (template?.sections) {
    template.sections.forEach(section => {
      section.items.forEach(item => {
        totalQuestions++;
        const answer = audit.answers?.[item.id];
        if (answer === 'pass') passCount++;
        else if (answer === 'fail') failCount++;
        else if (answer === 'na') naCount++;
      });
    });
  }

  // Metrics Grid
  const metricColWidth = metricsWidth / 4;
  const metrics = [
    { label: 'TOTAL', value: totalQuestions, color: COLORS.gray800 },
    { label: 'PASS', value: passCount, color: COLORS.success },
    { label: 'FAIL', value: failCount, color: COLORS.danger },
    { label: 'N/A', value: naCount, color: COLORS.gray600 },
  ];

  metrics.forEach((metric, idx) => {
    const x = metricsX + (idx * metricColWidth);

    doc.setTextColor(...metric.color);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${metric.value}`, x + metricColWidth / 2, yPos + 18, { align: 'center' });

    doc.setTextColor(...COLORS.gray600);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(metric.label, x + metricColWidth / 2, yPos + 28, { align: 'center' });
  });

  yPos += scoreBoxHeight + 15;

  // ============================================
  // AUDIT DETAILS TABLE
  // ============================================

  const detailsData = [
    ['Auditor', audit.createdBy || 'Unknown'],
    ['Location', audit.location || 'Not specified'],
    ['Date', format(new Date(audit.date), 'MMMM d, yyyy')],
    ['Completed', audit.completedAt ? format(new Date(audit.completedAt), 'MMMM d, yyyy h:mm a') : 'N/A'],
    ['Template', template?.category || 'General'],
  ];

  autoTable(doc, {
    startY: yPos,
    body: detailsData,
    theme: 'plain',
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: { top: 3, bottom: 3, left: 0, right: 10 },
      textColor: COLORS.gray800,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, textColor: COLORS.gray600 },
      1: { cellWidth: 'auto' },
    },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ============================================
  // FINDINGS SECTIONS
  // ============================================

  if (template?.sections) {
    template.sections.forEach((section, sectionIndex) => {
      checkPageBreak(50);

      // Section Header - Clean style
      doc.setFillColor(...COLORS.amazonDark);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

      doc.setTextColor(...COLORS.white);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${sectionIndex + 1}. ${section.title.toUpperCase()}`, margin + 5, yPos + 5.5);

      yPos += 12;

      // Questions Table - Executive Style
      const tableData = section.items.map((item, idx) => {
        const answer = audit.answers?.[item.id];
        const answerDisplay = getAnswerDisplay(answer, item.type);
        const note = audit.notes?.[item.id];

        return [
          `${idx + 1}`,
          item.text,
          item.critical ? 'CRITICAL' : '',
          answerDisplay.text,
          note || '',
        ];
      });

      autoTable(doc, {
        startY: yPos,
        head: [['#', 'INSPECTION ITEM', 'PRIORITY', 'RESULT', 'OBSERVATIONS']],
        body: tableData,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 8,
          cellPadding: 4,
          textColor: COLORS.gray800,
          lineColor: COLORS.gray200,
          lineWidth: 0.1,
          overflow: 'linebreak',
        },
        headStyles: {
          fillColor: COLORS.gray100,
          textColor: COLORS.gray600,
          fontStyle: 'bold',
          fontSize: 7,
        },
        alternateRowStyles: {
          fillColor: COLORS.white,
        },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 55, overflow: 'linebreak' },
          2: { cellWidth: 18, halign: 'center', fontSize: 7 },
          3: { cellWidth: 16, halign: 'center', fontStyle: 'bold' },
          4: { cellWidth: 'auto', overflow: 'linebreak', fontSize: 8 },
        },
        didParseCell: function (data) {
          // Result column styling
          if (data.section === 'body' && data.column.index === 3) {
            const value = data.cell.raw;
            if (value === 'PASS') {
              data.cell.styles.textColor = COLORS.success;
            } else if (value === 'FAIL') {
              data.cell.styles.textColor = COLORS.danger;
            }
          }
          // Critical column styling
          if (data.section === 'body' && data.column.index === 2 && data.cell.raw === 'CRITICAL') {
            data.cell.styles.textColor = COLORS.danger;
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Add photos for this section if any exist
      section.items.forEach((item) => {
        const photos = audit.questionPhotos?.[item.id] || [];
        if (photos.length > 0) {
          checkPageBreak(50);

          doc.setTextColor(...COLORS.gray600);
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.text(`EVIDENCE: ${item.text.substring(0, 60)}${item.text.length > 60 ? '...' : ''}`, margin, yPos);
          yPos += 4;

          const photoWidth = 35;
          const photoHeight = 28;
          let xPos = margin;

          photos.forEach((photo, idx) => {
            if (xPos + photoWidth > pageWidth - margin) {
              xPos = margin;
              yPos += photoHeight + 5;
              checkPageBreak(photoHeight + 10);
            }

            try {
              doc.addImage(photo, 'JPEG', xPos, yPos, photoWidth, photoHeight);
              doc.setDrawColor(...COLORS.gray200);
              doc.rect(xPos, yPos, photoWidth, photoHeight);
            } catch (e) {
              doc.setDrawColor(...COLORS.gray200);
              doc.setFillColor(...COLORS.gray100);
              doc.rect(xPos, yPos, photoWidth, photoHeight, 'FD');
              doc.setTextColor(...COLORS.gray600);
              doc.setFontSize(6);
              doc.text(`Photo ${idx + 1}`, xPos + photoWidth/2, yPos + photoHeight/2, { align: 'center' });
            }

            xPos += photoWidth + 5;
          });

          yPos += photoHeight + 8;
        }
      });
    });
  }

  // ============================================
  // CORRECTIVE ACTIONS SECTION
  // ============================================

  const auditActions = includeActions ? actions.filter(a => a.auditId === audit.id) : [];
  if (auditActions.length > 0) {
    checkPageBreak(60);

    yPos += 5;
    drawDivider(doc, yPos, margin, pageWidth, COLORS.gray200);
    yPos += 10;

    // Actions Header
    doc.setTextColor(...COLORS.danger);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('CORRECTIVE ACTIONS', margin, yPos);

    doc.setTextColor(...COLORS.gray600);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${auditActions.length} action${auditActions.length > 1 ? 's' : ''} required`, margin + 55, yPos);

    yPos += 8;

    // Actions Table
    const actionTableData = auditActions.map((action, idx) => [
      `${idx + 1}`,
      action.questionText || action.title || 'Action Required',
      action.priority?.toUpperCase() || 'MEDIUM',
      action.status?.replace('_', ' ')?.toUpperCase() || 'OPEN',
      action.owner || '-',
      action.dueDate ? format(new Date(action.dueDate), 'MMM d, yyyy') : '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'ISSUE DESCRIPTION', 'PRIORITY', 'STATUS', 'OWNER', 'DUE DATE']],
      body: actionTableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 4,
        textColor: COLORS.gray800,
        lineColor: COLORS.gray200,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [254, 226, 226],
        textColor: COLORS.danger,
        fontStyle: 'bold',
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 'auto', overflow: 'linebreak' },
        2: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const value = data.cell.raw;
          if (value === 'HIGH') {
            data.cell.styles.textColor = COLORS.danger;
          } else if (value === 'MEDIUM') {
            data.cell.styles.textColor = COLORS.warning;
          } else {
            data.cell.styles.textColor = [0, 102, 204];
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

  // ============================================
  // ADDITIONAL NOTES
  // ============================================

  if (audit.globalNotes) {
    checkPageBreak(50);

    drawDivider(doc, yPos, margin, pageWidth, COLORS.gray200);
    yPos += 10;

    doc.setTextColor(...COLORS.gray600);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ADDITIONAL NOTES', margin, yPos);
    yPos += 6;

    doc.setTextColor(...COLORS.gray800);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(audit.globalNotes, pageWidth - 2 * margin);
    doc.text(splitNotes, margin, yPos);

    yPos += splitNotes.length * 4 + 10;
  }

  // ============================================
  // AI INSIGHTS SECTION
  // ============================================

  if (includeAIInsights && aiInsights) {
    checkPageBreak(80);

    doc.addPage();
    yPos = 20;

    // AI Insights Header
    doc.setFillColor(...COLORS.amazonOrange);
    doc.rect(0, 0, pageWidth, 4, 'F');

    doc.setTextColor(...COLORS.amazonDark);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('AI-GENERATED INSIGHTS', margin, yPos);

    yPos += 10;
    drawDivider(doc, yPos, margin, pageWidth, COLORS.amazonOrange);
    yPos += 12;

    // Executive Summary
    if (aiInsights.summary) {
      doc.setTextColor(...COLORS.gray600);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('EXECUTIVE SUMMARY', margin, yPos);
      yPos += 6;

      doc.setTextColor(...COLORS.gray800);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(aiInsights.summary, pageWidth - 2 * margin);
      doc.text(summaryLines, margin, yPos);
      yPos += summaryLines.length * 4 + 10;
    }

    // Key Findings
    if (aiInsights.keyFindings && aiInsights.keyFindings.length > 0) {
      checkPageBreak(40);

      doc.setTextColor(...COLORS.gray600);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('KEY FINDINGS', margin, yPos);
      yPos += 6;

      aiInsights.keyFindings.forEach((finding, idx) => {
        checkPageBreak(15);
        const lines = doc.splitTextToSize(`${idx + 1}. ${finding}`, pageWidth - 2 * margin - 10);
        doc.setTextColor(...COLORS.gray800);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 4 + 3;
      });
      yPos += 5;
    }

    // Recommendations
    if (aiInsights.recommendations && aiInsights.recommendations.length > 0) {
      checkPageBreak(40);

      doc.setTextColor(...COLORS.success);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATIONS', margin, yPos);
      yPos += 6;

      aiInsights.recommendations.forEach((rec, idx) => {
        checkPageBreak(15);
        const lines = doc.splitTextToSize(`${idx + 1}. ${rec}`, pageWidth - 2 * margin - 10);
        doc.setTextColor(...COLORS.gray800);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 4 + 3;
      });
      yPos += 5;
    }

    // Risk Areas
    if (aiInsights.riskAreas && aiInsights.riskAreas.length > 0) {
      checkPageBreak(40);

      doc.setTextColor(...COLORS.danger);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('AREAS OF CONCERN', margin, yPos);
      yPos += 6;

      aiInsights.riskAreas.forEach((risk, idx) => {
        checkPageBreak(15);
        const lines = doc.splitTextToSize(`${idx + 1}. ${risk}`, pageWidth - 2 * margin - 10);
        doc.setTextColor(...COLORS.gray800);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(lines, margin + 5, yPos);
        yPos += lines.length * 4 + 3;
      });
      yPos += 10;
    }

    // AI Disclaimer
    checkPageBreak(25);
    doc.setFillColor(...COLORS.gray100);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 18, 2, 2, 'F');
    doc.setTextColor(...COLORS.gray600);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('DISCLAIMER: These insights are generated by AI and should be reviewed by qualified personnel.', margin + 5, yPos + 6);
    doc.text('Always verify recommendations against current safety regulations and organizational policies.', margin + 5, yPos + 12);

    yPos += 25;
  }

  // ============================================
  // SIGNATURE SECTION
  // ============================================

  if (audit.signature) {
    checkPageBreak(60);

    yPos += 5;
    drawDivider(doc, yPos, margin, pageWidth, COLORS.gray200);
    yPos += 10;

    doc.setTextColor(...COLORS.gray600);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('AUDITOR VERIFICATION', margin, yPos);
    yPos += 10;

    try {
      doc.addImage(audit.signature, 'PNG', margin, yPos, 50, 25);
    } catch (e) {
      doc.setTextColor(...COLORS.gray800);
      doc.setFontSize(9);
      doc.text('[Signature on file]', margin, yPos + 15);
    }

    doc.setDrawColor(...COLORS.gray400);
    doc.line(margin, yPos + 28, margin + 60, yPos + 28);

    doc.setTextColor(...COLORS.gray600);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(audit.createdBy || 'Auditor', margin, yPos + 35);
    doc.text(format(new Date(audit.completedAt || audit.date), 'MMMM d, yyyy'), margin, yPos + 42);
  }

  // ============================================
  // FOOTER ON ALL PAGES
  // ============================================

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Bottom accent line
    doc.setFillColor(...COLORS.amazonOrange);
    doc.rect(0, pageHeight - 3, pageWidth, 3, 'F');

    // Page number
    doc.setTextColor(...COLORS.gray600);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });

    // Confidential notice
    doc.setFontSize(7);
    doc.text('CONFIDENTIAL', margin, pageHeight - 8);

    // Generation timestamp
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // ============================================
  // SAVE FILE
  // ============================================

  const auditDate = format(new Date(audit.date), 'yyyy-MM-dd');
  const templateName = (template?.title || audit.templateTitle || 'Audit').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `${templateName}_${audit.location || 'Report'}_${auditDate}.pdf`;

  doc.save(filename);

  return filename;
};

// ============================================
// ACTIONS PDF EXPORT - Executive Style
// ============================================

export const generateActionsPDF = (actions, stationFilter = null) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  const filteredActions = stationFilter
    ? actions.filter(a => a.location === stationFilter)
    : actions;

  const checkPageBreak = (requiredSpace = 30) => {
    if (yPos + requiredSpace > pageHeight - 25) {
      doc.addPage();
      yPos = 20;
      return true;
    }
    return false;
  };

  // ============================================
  // HEADER
  // ============================================

  doc.setFillColor(...COLORS.amazonOrange);
  doc.rect(0, 0, pageWidth, 4, 'F');

  yPos = 20;

  doc.setTextColor(...COLORS.amazonDark);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTIONS REPORT', margin, yPos);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.gray600);
  doc.text(format(new Date(), 'MMMM d, yyyy'), pageWidth - margin, yPos, { align: 'right' });
  if (stationFilter) {
    doc.text(`Location: ${stationFilter}`, pageWidth - margin, yPos + 7, { align: 'right' });
  }

  yPos += 15;
  drawDivider(doc, yPos, margin, pageWidth, COLORS.gray200);
  yPos += 15;

  // ============================================
  // SUMMARY METRICS
  // ============================================

  const openCount = filteredActions.filter(a => a.status === 'open').length;
  const inProgressCount = filteredActions.filter(a => a.status === 'in_progress').length;
  const completedCount = filteredActions.filter(a => a.status === 'completed').length;
  const highPriorityCount = filteredActions.filter(a => a.priority === 'high').length;

  const boxWidth = (pageWidth - 2 * margin - 15) / 4;
  const boxHeight = 30;

  const summaryBoxes = [
    { label: 'OPEN', value: openCount, color: COLORS.danger },
    { label: 'IN PROGRESS', value: inProgressCount, color: COLORS.warning },
    { label: 'COMPLETED', value: completedCount, color: COLORS.success },
    { label: 'HIGH PRIORITY', value: highPriorityCount, color: COLORS.danger },
  ];

  summaryBoxes.forEach((box, idx) => {
    const x = margin + idx * (boxWidth + 5);

    doc.setFillColor(...COLORS.gray100);
    doc.roundedRect(x, yPos, boxWidth, boxHeight, 2, 2, 'F');

    doc.setTextColor(...box.color);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(`${box.value}`, x + boxWidth / 2, yPos + 14, { align: 'center' });

    doc.setTextColor(...COLORS.gray600);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(box.label, x + boxWidth / 2, yPos + 24, { align: 'center' });
  });

  yPos += boxHeight + 15;

  // ============================================
  // ACTIONS BY STATUS
  // ============================================

  const statusGroups = [
    { status: 'open', label: 'OPEN ACTIONS', color: COLORS.danger, bgColor: [254, 226, 226] },
    { status: 'in_progress', label: 'IN PROGRESS', color: COLORS.warning, bgColor: [254, 243, 199] },
    { status: 'completed', label: 'COMPLETED', color: COLORS.success, bgColor: [220, 252, 231] },
  ];

  statusGroups.forEach(({ status, label, color, bgColor }) => {
    const groupActions = filteredActions.filter(a => a.status === status);
    if (groupActions.length === 0) return;

    checkPageBreak(50);

    // Section Header
    doc.setFillColor(...color);
    doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');

    doc.setTextColor(...COLORS.white);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${label} (${groupActions.length})`, margin + 5, yPos + 5.5);

    yPos += 12;

    // Actions Table
    const tableData = groupActions.map((action, idx) => [
      `${idx + 1}`,
      action.questionText || action.title || 'Action',
      action.priority?.toUpperCase() || 'MEDIUM',
      action.location || '-',
      action.notes || action.description || '',
      action.dueDate ? format(new Date(action.dueDate), 'MMM d') : '-',
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['#', 'ISSUE', 'PRIORITY', 'LOCATION', 'NOTES', 'DUE']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: COLORS.gray800,
        lineColor: COLORS.gray200,
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: bgColor,
        textColor: color,
        fontStyle: 'bold',
        fontSize: 7,
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 'auto', overflow: 'linebreak' },
        2: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 45, overflow: 'linebreak' },
        5: { cellWidth: 20, halign: 'center' },
      },
      didParseCell: function (data) {
        if (data.section === 'body' && data.column.index === 2) {
          const value = data.cell.raw;
          if (value === 'HIGH') {
            data.cell.styles.textColor = COLORS.danger;
          } else if (value === 'MEDIUM') {
            data.cell.styles.textColor = COLORS.warning;
          } else {
            data.cell.styles.textColor = [0, 102, 204];
          }
        }
      },
    });

    yPos = doc.lastAutoTable.finalY + 12;
  });

  // ============================================
  // FOOTER
  // ============================================

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFillColor(...COLORS.amazonOrange);
    doc.rect(0, pageHeight - 3, pageWidth, 3, 'F');

    doc.setTextColor(...COLORS.gray600);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    doc.setFontSize(7);
    doc.text('CONFIDENTIAL', margin, pageHeight - 8);
    doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Save
  const dateStr = format(new Date(), 'yyyy-MM-dd');
  const filename = stationFilter
    ? `Actions_${stationFilter}_${dateStr}.pdf`
    : `Actions_Report_${dateStr}.pdf`;

  doc.save(filename);

  return filename;
};

export default generateAuditPDF;
