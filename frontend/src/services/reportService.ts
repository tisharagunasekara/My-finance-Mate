import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Transaction {
  _id: string;
  userId: string;
  type: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  description?: string;
}

// Helper function to generate random colors for charts
const generateRandomColors = (count: number): string[] => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    // Generate colors with good contrast and opacity
    colors.push(`rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, 0.7)`);
  }
  return colors;
};

// Define report data interface
export interface ReportData {
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    transactionCount: number;
  };
  categoryBreakdown: { [category: string]: number };
  monthlyData: { [month: string]: { income: number; expense: number } };
  charts: {
    incomeVsExpense: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string[];
      }>;
    };
    categoryDistribution: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string[];
      }>;
    };
    monthlyTrend: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string;
      }>;
    };
  };
}

// Generate report from transactions
export const generateTransactionReport = async (transactions: Transaction[]): Promise<ReportData> => {
  // Calculate summary statistics
  const summary = {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    transactionCount: transactions.length,
  };

  // Category breakdown
  const categoryBreakdown: { [category: string]: number } = {};
  
  // Monthly data
  const monthlyData: { [month: string]: { income: number; expense: number } } = {};

  // Process all transactions
  transactions.forEach(transaction => {
    // Update summary
    if (transaction.type === 'income') {
      summary.totalIncome += transaction.amount;
    } else {
      summary.totalExpense += transaction.amount;
    }

    // Update category breakdown
    if (!categoryBreakdown[transaction.category]) {
      categoryBreakdown[transaction.category] = 0;
    }
    categoryBreakdown[transaction.category] += transaction.amount;

    // Update monthly data
    const date = new Date(transaction.date);
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = { income: 0, expense: 0 };
    }
    
    if (transaction.type === 'income') {
      monthlyData[monthYear].income += transaction.amount;
    } else {
      monthlyData[monthYear].expense += transaction.amount;
    }
  });

  // Calculate net balance
  summary.netBalance = summary.totalIncome - summary.totalExpense;

  // Prepare chart data
  const incomeVsExpenseChart = {
    labels: ['Income', 'Expense'],
    datasets: [
      {
        label: 'Amount',
        data: [summary.totalIncome, summary.totalExpense],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
      },
    ],
  };

  const categoryLabels = Object.keys(categoryBreakdown);
  const categoryValues = categoryLabels.map(category => categoryBreakdown[category]);
  const categoryDistributionChart = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Category Distribution',
        data: categoryValues,
        backgroundColor: generateRandomColors(categoryLabels.length),
      },
    ],
  };

  // Monthly trend data
  const months = Object.keys(monthlyData).sort((a, b) => {
    const [monthA, yearA] = a.split('/').map(Number);
    const [monthB, yearB] = b.split('/').map(Number);
    return yearA === yearB ? monthA - monthB : yearA - yearB;
  });

  const monthlyTrendChart = {
    labels: months,
    datasets: [
      {
        label: 'Income',
        data: months.map(month => monthlyData[month].income),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Expense',
        data: months.map(month => monthlyData[month].expense),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    summary,
    categoryBreakdown,
    monthlyData,
    charts: {
      incomeVsExpense: incomeVsExpenseChart,
      categoryDistribution: categoryDistributionChart,
      monthlyTrend: monthlyTrendChart,
    },
  };
};

// Define extended type for jsPDF with autotable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDFWithAutoTable;
  lastAutoTable: {
    finalY: number;
  };
}

export const downloadReportAsPDF = async (reportData: ReportData): Promise<void> => {
  // Create a new PDF document
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add title
  doc.setFontSize(22);
  doc.setTextColor(33, 80, 162);
  doc.text('Financial Report', pageWidth / 2, 20, { align: 'center' });
  
  // Add date
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, { align: 'center' });
  
  // Add summary section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Summary', 14, 45);
  
  // Add summary data
  doc.setFontSize(12);
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  doc.text(`Total Income: ${formatter.format(reportData.summary.totalIncome)}`, 20, 55);
  doc.text(`Total Expense: ${formatter.format(reportData.summary.totalExpense)}`, 20, 65);
  doc.text(`Net Balance: ${formatter.format(reportData.summary.netBalance)}`, 20, 75);
  doc.text(`Transaction Count: ${reportData.summary.transactionCount}`, 20, 85);
  
  // Add category breakdown section
  doc.setFontSize(16);
  doc.text('Category Breakdown', 14, 105);
  
  // Prepare table data for category breakdown
  const categoryTableData = Object.entries(reportData.categoryBreakdown).map(([category, amount]) => [
    category.charAt(0).toUpperCase() + category.slice(1),
    formatter.format(amount)
  ]);
  
  // Add category table
  autoTable(doc, {
    head: [['Category', 'Amount']],
    body: categoryTableData,
    startY: 110,
    margin: { left: 14 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  // Add monthly data section
  doc.setFontSize(16);
  const finalY = doc.lastAutoTable.finalY + 20;
  doc.text('Monthly Breakdown', 14, finalY);
  
  // Prepare table data for monthly breakdown
  const monthlyTableData = Object.entries(reportData.monthlyData).map(([month, data]) => [
    month,
    formatter.format(data.income),
    formatter.format(data.expense),
    formatter.format(data.income - data.expense)
  ]);
  
  // Add monthly table
  autoTable(doc, {
    head: [['Month', 'Income', 'Expense', 'Net']],
    body: monthlyTableData,
    startY: finalY + 5,
    margin: { left: 14 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  // Save the PDF
  doc.save('financial_report.pdf');
  
  return Promise.resolve();
};

export const downloadReportAsExcel = async (reportData: ReportData): Promise<void> => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Format currency (removed unused formatter)
  
  // Create summary sheet
  const summaryData = [
    ['Financial Report Summary', ''],
    ['Generated on', new Date().toLocaleDateString()],
    ['', ''],
    ['Total Income', reportData.summary.totalIncome],
    ['Total Expense', reportData.summary.totalExpense],
    ['Net Balance', reportData.summary.netBalance],
    ['Transaction Count', reportData.summary.transactionCount],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Create category breakdown sheet
  const categoryHeaders = ['Category', 'Amount'];
  const categoryData = Object.entries(reportData.categoryBreakdown).map(([category, amount]) => [
    category.charAt(0).toUpperCase() + category.slice(1),
    amount
  ]);
  
  const categorySheet = XLSX.utils.aoa_to_sheet([categoryHeaders, ...categoryData]);
  XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Breakdown');
  
  // Create monthly breakdown sheet
  const monthlyHeaders = ['Month', 'Income', 'Expense', 'Net Balance'];
  const monthlyData = Object.entries(reportData.monthlyData).map(([month, data]) => [
    month,
    data.income,
    data.expense,
    data.income - data.expense
  ]);
  
  const monthlySheet = XLSX.utils.aoa_to_sheet([monthlyHeaders, ...monthlyData]);
  XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly Breakdown');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, 'financial_report.xlsx');
  
  return Promise.resolve();
};

// Define automated budget plan data interface
export interface AutoBudgetPlanData {
  monthlyIncome: number;
  essentials: number;
  savings: number;
  discretionary: number;
  categoryBreakdown: {
    category: string;
    totalSpent: number;
    percentage: number;
    recommendedBudget: number;
  }[];
}

export const downloadAutomatedBudgetPlanAsPDF = async (budgetPlan: AutoBudgetPlanData): Promise<void> => {
  // Create a new PDF document
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Format current date and time for display
  const now = new Date();
  const dateFormatted = now.toLocaleDateString();
  const timeFormatted = now.toLocaleTimeString();
  const dateTimeString = `Generated on: ${dateFormatted} at ${timeFormatted}`;
  
  // Add title
  doc.setFontSize(22);
  doc.setTextColor(33, 80, 162);
  doc.text('Automated Budget Plan (50/30/20 Rule)', pageWidth / 2, 20, { align: 'center' });
  
  // Add date and time
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(dateTimeString, pageWidth / 2, 30, { align: 'center' });
  
  // Add summary section
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Budget Allocation Summary', 14, 45);
  
  // Add allocation data
  doc.setFontSize(12);
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  doc.text(`Monthly Income: ${formatter.format(budgetPlan.monthlyIncome)}`, 20, 55);
  doc.text(`Essentials (50%): ${formatter.format(budgetPlan.essentials)}`, 20, 65);
  doc.text(`Discretionary (30%): ${formatter.format(budgetPlan.discretionary)}`, 20, 75);
  doc.text(`Savings (20%): ${formatter.format(budgetPlan.savings)}`, 20, 85);
  
  // Add category breakdown section
  doc.setFontSize(16);
  doc.text('Category Breakdown', 14, 105);
  
  // Prepare table data for category breakdown
  const categoryTableData = budgetPlan.categoryBreakdown.map(item => [
    item.category,
    formatter.format(item.totalSpent),
    `${item.percentage.toFixed(1)}%`,
    formatter.format(item.recommendedBudget)
  ]);
  
  // Add category table
  autoTable(doc, {
    head: [['Category', 'Current Spending', 'Percent of Total', 'Recommended Budget']],
    body: categoryTableData,
    startY: 110,
    margin: { left: 14 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 'auto', halign: 'right' },
      2: { cellWidth: 'auto', halign: 'right' },
      3: { cellWidth: 'auto', halign: 'right' },
    }
  });
  
  const finalY = doc.lastAutoTable.finalY + 20;
  
  // Add budget tips section
  doc.setFontSize(16);
  doc.text('Budget Tips', 14, finalY);
  doc.setFontSize(11);
  doc.text('• Try to keep your essential expenses to about 50% of your income', 20, finalY + 10);
  doc.text('• Aim to save at least 20% of your income for emergencies and future goals', 20, finalY + 17);
  doc.text('• Review your discretionary spending categories to identify areas for potential savings', 20, finalY + 24);
  doc.text('• Consider using the envelope method for categories where you tend to overspend', 20, finalY + 31);
  
  // Add footer with date/time and app name
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  const footerText = `Generated by My Finance Mate on ${dateFormatted} at ${timeFormatted}`;
  doc.text(footerText, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  
  // Save the PDF
  const fileName = `automated_budget_plan_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return Promise.resolve();
};
