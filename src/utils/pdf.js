import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { sections } from '../data/checklist';

export const generatePdf = (audit) => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Aurora Audit Platform', 10, 10);
  doc.setFontSize(12);
  doc.text(`Station: ${audit.station}`, 10, 20);
  doc.text(`Date: ${new Date(audit.date).toLocaleString()}`, 10, 28);

  let y = 40;
  sections.forEach((section) => {
    doc.setFontSize(14);
    doc.text(section.title, 10, y);
    y += 6;
    const rows = section.items.map((item) => {
      const r = audit.responses?.[section.id]?.[item.id] || {};
      return [item.text, r.answer || '', r.severity || '', r.notes || ''];
    });
    doc.autoTable({
      startY: y,
      head: [['Question', 'Answer', 'Severity', 'Notes']],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 8 },
    });
    y = doc.lastAutoTable.finalY + 10;
  });

  doc.save(`audit-${audit.station}-${audit.id}.pdf`);
};
