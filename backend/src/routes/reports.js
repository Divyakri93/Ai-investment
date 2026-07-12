import { Router } from 'express';
import { ReportRepository } from '../models/Report.js';
import { generateInvestmentMemoPDF } from '../services/pdfService.js';

const router = Router();

router.get('/reports', async (req, res) => {
  try {
    const reports = await ReportRepository.listReports();
    res.json(reports);
  } catch (err) {
    console.error('Error listing reports:', err);
    res.status(500).json({ error: 'Failed to list reports' });
  }
});

router.get('/reports/:id', async (req, res) => {
  try {
    const report = await ReportRepository.getReportById(String(req.params.id));
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    res.json(report);
  } catch (err) {
    console.error('Error fetching report details:', err);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

router.get('/reports/:id/pdf', async (req, res) => {
  try {
    const report = await ReportRepository.getReportById(String(req.params.id));
    if (!report) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }

    const pdfBuffer = await generateInvestmentMemoPDF(report);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="InvestIQ_Memo_${report.resolvedTicker || 'Report'}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF memo:', err);
    res.status(500).json({ error: 'Failed to generate PDF memo' });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    const success = await ReportRepository.deleteReportById(String(req.params.id));
    if (!success) {
      res.status(404).json({ error: 'Report not found or already deleted' });
      return;
    }
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Error deleting report:', err);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

router.delete('/reports', async (req, res) => {
  try {
    await ReportRepository.deleteAllReports();
    res.json({ success: true, message: 'All reports cleared successfully' });
  } catch (err) {
    console.error('Error clearing all reports:', err);
    res.status(500).json({ error: 'Failed to clear all reports' });
  }
});

export default router;
