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

export const generateAuditPDF = (audit, template) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
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

  // Header with logo area
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AuditFlow Pro', margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Audit Report', margin, 27);

  // Report metadata on the right
  doc.setFontSize(9);
  doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, pageWidth - margin, 18, { align: 'right' });
  doc.text(`Report ID: ${audit.id.slice(-8).toUpperCase()}`, pageWidth - margin, 27, { align: 'right' });

  yPos = 50;

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

        return [
          `${idx + 1}`,
          item.text,
          item.critical ? 'Yes' : '',
          answerDisplay.text,
          note || '',
        ];
      });

      const tableResult = autoTable(doc, {
        startY: yPos,
        head: [['#', 'Question', 'Critical', 'Result', 'Notes']],
        body: tableData,
        margin: { left: margin, right: margin },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: COLORS.text,
          lineColor: COLORS.border,
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [241, 245, 249], // Slate 100
          textColor: COLORS.textLight,
          fontStyle: 'bold',
          fontSize: 8,
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 20, halign: 'center' },
          4: { cellWidth: 40 },
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
        },
      });

      yPos = (tableResult?.finalY || doc.lastAutoTable?.finalY || yPos) + 10;
    });
  }

  // Global Notes
  if (audit.globalNotes) {
    checkPageBreak(40);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 2, 2, 'F');

    doc.setTextColor(...COLORS.textLight);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ADDITIONAL NOTES', margin + 5, yPos + 8);

    doc.setTextColor(...COLORS.text);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(audit.globalNotes, pageWidth - 2 * margin - 10);
    doc.text(splitNotes, margin + 5, yPos + 16);

    yPos += 35 + (splitNotes.length - 1) * 4;
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
      'Generated by AuditFlow Pro',
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

export default generateAuditPDF;
