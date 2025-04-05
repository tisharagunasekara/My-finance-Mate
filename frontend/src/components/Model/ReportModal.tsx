import React, { useState } from 'react';
import { ReportData, downloadReportAsPDF, downloadReportAsExcel } from '../../services/reportService';
import { toast } from 'react-toastify';

interface ReportModalProps {
  reportData: ReportData | null;
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ reportData, onClose }) => {
  const [isDownloading, setIsDownloading] = useState<{ pdf: boolean; excel: boolean }>({
    pdf: false,
    excel: false
  });

  if (!reportData) return null;

  const handleDownloadPDF = async () => {
    setIsDownloading(prev => ({ ...prev, pdf: true }));
    try {
      await downloadReportAsPDF(reportData);
      toast.success("PDF report downloaded successfully");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF report. Please try again.");
    } finally {
      setIsDownloading(prev => ({ ...prev, pdf: false }));
    }
  };

  const handleDownloadExcel = async () => {
    setIsDownloading(prev => ({ ...prev, excel: true }));
    try {
      await downloadReportAsExcel(reportData);
      toast.success("Excel report downloaded successfully");
    } catch (error) {
      console.error("Error downloading Excel:", error);
      toast.error("Failed to download Excel report. Please try again.");
    } finally {
      setIsDownloading(prev => ({ ...prev, excel: false }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4 p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Financial Report</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-6">
          <h3 className="text-lg font-semibold mb-3">Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">Total Income</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatCurrency(reportData.summary.totalIncome)}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">Total Expense</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(reportData.summary.totalExpense)}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">Net Balance</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatCurrency(reportData.summary.netBalance)}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
              <p className="text-sm text-purple-700 dark:text-purple-300">Transactions</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {reportData.summary.transactionCount}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 p-6">
          <h3 className="text-lg font-semibold mb-3">Category Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(reportData.categoryBreakdown).map(([category, amount]) => (
                  <tr key={category}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-4 mt-6 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading.pdf}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isDownloading.pdf ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={isDownloading.excel}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isDownloading.excel ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Excel
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
