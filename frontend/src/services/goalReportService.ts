import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Goal {
  _id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
  notes?: string;
}

/**
 * Generates and downloads a PDF report for financial goals
 * @param goals Array of financial goal objects
 * @param generateExcel Optional flag to also generate Excel report
 */
export const downloadGoalsReport = async (goals: Goal[], generateExcel = false): Promise<void> => {
  // Create a PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Add header with gradient background
  doc.setFillColor(33, 80, 162); // Dark blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  // Add title
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255); // White
  doc.text('Financial Goals Report', pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(12);
  doc.setTextColor(220, 220, 220); // Light gray
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
  
  // Add summary section
  doc.setFontSize(18);
  doc.setTextColor(33, 80, 162); // Dark blue
  doc.text('Goals Summary', 14, 55);
  
  // Add decorative line
  doc.setDrawColor(33, 80, 162);
  doc.setLineWidth(0.5);
  doc.line(14, 58, pageWidth - 14, 58);
  
  // Summary statistics
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = (totalCurrentAmount / totalTargetAmount) * 100 || 0;
  const completedGoals = goals.filter(goal => goal.status.toLowerCase() === 'completed').length;
  const inProgressGoals = goals.filter(goal => goal.status.toLowerCase() === 'in progress').length;
  const notStartedGoals = goals.length - completedGoals - inProgressGoals;
  
  doc.setFontSize(12);
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  // Add summary cards
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.2);
  
  // Financial summary card
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(14, 65, (pageWidth - 28) / 2 - 5, 60, 3, 3, 'F');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(14);
  doc.text('Financial Overview', 24, 75);
  doc.setFontSize(12);
  doc.text(`Target Amount: ${formatter.format(totalTargetAmount)}`, 24, 90);
  doc.text(`Current Amount: ${formatter.format(totalCurrentAmount)}`, 24, 102);
  doc.text(`Remaining Amount: ${formatter.format(totalTargetAmount - totalCurrentAmount)}`, 24, 114);
  
  // Progress summary card
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(pageWidth / 2 + 5, 65, (pageWidth - 28) / 2 - 5, 60, 3, 3, 'F');
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(14);
  doc.text('Progress Summary', pageWidth / 2 + 15, 75);
  doc.setFontSize(12);
  doc.text(`Overall Progress: ${overallProgress.toFixed(2)}%`, pageWidth / 2 + 15, 90);
  doc.text(`Completed Goals: ${completedGoals} of ${goals.length}`, pageWidth / 2 + 15, 102);
  doc.text(`Goals In Progress: ${inProgressGoals}`, pageWidth / 2 + 15, 114);
  
  // Create a visual progress bar
  const barX = 14;
  const barY = 135;
  const barWidth = pageWidth - 28;
  const barHeight = 15;
  
  // Draw background of the progress bar
  doc.setFillColor(230, 230, 230);
  doc.roundedRect(barX, barY, barWidth, barHeight, 3, 3, 'F');
  
  // Draw the filled portion of the progress bar
  if (overallProgress > 0) {
    const filledWidth = Math.min(overallProgress / 100, 1) * barWidth;
    doc.setFillColor(41, 128, 185);
    doc.roundedRect(barX, barY, filledWidth, barHeight, 3, 3, 'F');
  }
  
  // Add progress percentage text over the bar
  doc.setTextColor(255, 255, 255);
  if (overallProgress < 30) {
    doc.setTextColor(80, 80, 80); // Dark text for low percentages
  }
  doc.setFontSize(10);
  doc.text(`${overallProgress.toFixed(2)}%`, barX + barWidth / 2, barY + barHeight / 2 + 3, { align: 'center' });
  
  // Generate goals table with improved styling
  const tableData = goals.map(goal => {
    // Calculate progress percentage
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    
    return [
      goal.goalName,
      formatter.format(goal.targetAmount),
      formatter.format(goal.currentAmount),
      `${progress.toFixed(2)}%`,
      new Date(goal.deadline).toLocaleDateString(),
      goal.status,
    ];
  });
  
  // Add table title
  doc.setFontSize(18);
  doc.setTextColor(33, 80, 162);
  doc.text('Goals Details', 14, 165);
  
  // Add decorative line
  doc.setDrawColor(33, 80, 162);
  doc.setLineWidth(0.5);
  doc.line(14, 168, pageWidth - 14, 168);
  
  // Generate the table
  autoTable(doc, {
    startY: 175,
    head: [['Goal Name', 'Target', 'Current', 'Progress', 'Deadline', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    styles: {
      fontSize: 10,
      cellPadding: 3,
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Name column
      3: { halign: 'center' }, // Progress column
      5: { halign: 'center' }  // Status column
    },
    alternateRowStyles: {
      fillColor: [245, 250, 254] // Light blue for alternate rows
    }
  });
  
  // Add footer with page number
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10);
    doc.text('My Finance Mate', 14, pageHeight - 10);
  }

  // Save the PDF
  doc.save('financial_goals_report.pdf');
  
  // Optionally generate Excel version
  if (generateExcel) {
    await generateExcelReport(goals);
  }
  
  return Promise.resolve();
};

/**
 * Generates and downloads an Excel report for financial goals
 * @param goals Array of financial goal objects
 */
const generateExcelReport = async (goals: Goal[]): Promise<void> => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Create summary sheet data
  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const overallProgress = (totalCurrentAmount / totalTargetAmount) * 100 || 0;
  const completedGoals = goals.filter(goal => goal.status.toLowerCase() === 'completed').length;
  
  const summaryData = [
    ['Financial Goals Summary', ''],
    ['Generated on', new Date().toLocaleDateString()],
    ['', ''],
    ['Total Target Amount', totalTargetAmount],
    ['Total Current Amount', totalCurrentAmount],
    ['Overall Progress', `${overallProgress.toFixed(2)}%`],
    ['Completed Goals', `${completedGoals} of ${goals.length}`],
  ];
  
  // Create goals data for second sheet
  const goalsHeaders = ['Goal Name', 'Target Amount', 'Current Amount', 'Progress', 'Deadline', 'Status', 'Notes'];
  const goalsData = goals.map(goal => [
    goal.goalName,
    goal.targetAmount,
    goal.currentAmount,
    ((goal.currentAmount / goal.targetAmount) * 100).toFixed(2) + '%',
    new Date(goal.deadline).toLocaleDateString(),
    goal.status,
    goal.notes || ''
  ]);
  
  // Add sheets to workbook
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  const goalsSheet = XLSX.utils.aoa_to_sheet([goalsHeaders, ...goalsData]);
  XLSX.utils.book_append_sheet(workbook, goalsSheet, 'Goals');
  
  // Apply some basic styling (column widths)
  const summaryWscols = [
    {wch: 20}, // Column A width
    {wch: 18}, // Column B width
  ];
  
  const goalsWscols = [
    {wch: 25}, // Goal Name
    {wch: 15}, // Target Amount
    {wch: 15}, // Current Amount
    {wch: 10}, // Progress
    {wch: 12}, // Deadline
    {wch: 12}, // Status
    {wch: 35}, // Notes
  ];
  
  summarySheet['!cols'] = summaryWscols;
  goalsSheet['!cols'] = goalsWscols;
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, 'financial_goals_report.xlsx');
  
  return Promise.resolve();
};

/**
 * Separately export Excel generation for when that format is specifically requested
 * @param goals Array of financial goal objects
 */
export const downloadGoalsReportAsExcel = async (goals: Goal[]): Promise<void> => {
  return generateExcelReport(goals);
};
