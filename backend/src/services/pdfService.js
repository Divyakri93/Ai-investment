import PDFDocument from 'pdfkit';

export async function generateInvestmentMemoPDF(report) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc
        .fillColor('#0B0F19')
        .rect(0, 0, doc.page.width, 90)
        .fill();

      doc
        .fontSize(22)
        .fillColor('#00F0FF')
        .text('INVESTIQ — INSTITUTIONAL AI INVESTMENT MEMO', 50, 30);

      doc
        .fontSize(10)
        .fillColor('#94A3B8')
        .text(`Generated: ${new Date().toUTCString()}`, 50, 60);

      doc.moveDown(3);

      doc
        .fontSize(20)
        .fillColor('#0F172A')
        .text(`${report.companyName} (${report.resolvedTicker})`, 50, 110);

      const verdictColor =
        report.verdict === 'INVEST'
          ? '#10B981'
          : report.verdict === 'WATCH'
          ? '#F59E0B'
          : report.verdict === 'INCOMPLETE'
          ? '#64748B'
          : '#EF4444';

      doc
        .fontSize(14)
        .fillColor(verdictColor)
        .text(`FINAL VERDICT: ${report.verdict} (${report.confidence}% Institutional Confidence)`, 50, 140);

      doc
        .fontSize(11)
        .fillColor('#334155')
        .text(`Executive Summary: ${report.reasoningSummary}`, 50, 165, { width: 500 });

      doc.moveDown(2);

      if (report.isPubliclyTraded === false || report.fundamentalsData?.isPubliclyTraded === false) {
        doc
          .fontSize(11)
          .fillColor('#7E22CE')
          .text('PRIVATE / NOT PUBLICLY TRADED COMPANY — QUALITATIVE EVALUATION ONLY', { underline: true });
        doc
          .fontSize(9)
          .fillColor('#4C1D95')
          .text(report.fundamentalsData?.publicStatusMessage || 'This company is not independently publicly traded. Qualitative assessment applied.', { width: 500 });
        doc.moveDown(1);
      }

      if (Array.isArray(report.dataGaps) && report.dataGaps.length > 0) {
        doc
          .fontSize(12)
          .fillColor('#DC2626')
          .text('DATA GAPS & DEGRADED RESEARCH WARNINGS:', { underline: true });
        report.dataGaps.forEach((gap, i) => {
          doc
            .fontSize(9)
            .fillColor('#991B1B')
            .text(`• [Gap #${i + 1}] ${gap}`, { width: 500 });
        });
        doc.moveDown(1);
      }

      doc
        .fontSize(14)
        .fillColor('#0F172A')
        .text('QUANTIFIED EVALUATION SCORECARD (0-10)', { underline: true });

      doc.moveDown(0.5);
      const s = report.scores || {};
      const printScore = (label, item) => {
        if (!item) return;
        doc
          .fontSize(11)
          .fillColor('#1E293B')
          .text(`${label}: ${item.score}/10 — ${item.rationale}`, { width: 500 });
      };

      printScore('Financial Health', s.financialHealth);
      printScore('Growth Potential', s.growthPotential);
      printScore('Market Position', s.marketPosition);
      printScore('Risk Level', s.riskLevel);

      doc.moveDown(1.5);

      doc
        .fontSize(14)
        .fillColor('#10B981')
        .text('BULL ANALYST THESIS', { underline: true });
      doc
        .fontSize(10)
        .fillColor('#334155')
        .text(report.bullCase || 'N/A', { width: 500 });

      doc.moveDown(1.5);

      doc
        .fontSize(14)
        .fillColor('#EF4444')
        .text('BEAR ANALYST THESIS', { underline: true });
      doc
        .fontSize(10)
        .fillColor('#334155')
        .text(report.bearCase || 'N/A', { width: 500 });

      doc.moveDown(1.5);

      doc
        .fontSize(14)
        .fillColor('#0F172A')
        .text('AUDIT CITATIONS & RESEARCH SOURCES', { underline: true });

      if (Array.isArray(report.sources)) {
        report.sources.forEach((src, idx) => {
          doc
            .fontSize(9)
            .fillColor('#2563EB')
            .text(`[${idx + 1}] ${src.title} — ${src.url}`, { width: 500 });
        });
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
