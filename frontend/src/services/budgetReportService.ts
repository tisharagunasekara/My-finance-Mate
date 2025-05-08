import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface CategoryData {
  category: string;
  budget: number;
  spent: number;
}

export interface MonthlyTrend {
  month: string;
  spent: number;
}

export interface BudgetReportData {
  totalBudget: number;
  totalSpent: number;
  categoryBreakdown: CategoryData[];
  monthlyTrends: MonthlyTrend[];
}

export const downloadBudgetReportPDF = async (report: BudgetReportData, preview = false) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text('Budget Report', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Budget: $${report.totalBudget.toFixed(2)}`, 14, 40);
    doc.text(`Total Spent: $${report.totalSpent.toFixed(2)}`, 14, 48);

    const catRows = report.categoryBreakdown.map(item => [
      item.category,
      `$${item.budget.toFixed(2)}`,
      `$${item.spent.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Category', 'Budget', 'Spent']],
      body: catRows,
      startY: 60,
      margin: { left: 14 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 144, 255] }
    });

    const finalY = doc.lastAutoTable?.finalY || 80;
    const trendRows = report.monthlyTrends.map(item => [
      item.month,
      `$${item.spent.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Month', 'Spent']],
      body: trendRows,
      startY: finalY + 10,
      margin: { left: 14 },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [46, 204, 113] }
    });

    if (preview) {
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } else {
      doc.save(`budget_report_${new Date().toISOString().split('T')[0]}.pdf`);
    }

    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};
