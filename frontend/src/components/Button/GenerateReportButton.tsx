import React, { useState } from 'react';
import { generateTransactionReport, ReportData } from '../../services/reportService';
import { toast } from 'react-toastify';
import ReportModal from '../Model/ReportModal';

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

interface GenerateReportButtonProps {
  transactions: Transaction[];
}

const GenerateReportButton: React.FC<GenerateReportButtonProps> = ({ transactions }) => {
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleGenerateReport = async () => {
    if (transactions.length === 0) {
      toast.warn("No transactions available to generate a report");
      return;
    }
    
    setIsLoading(true);
    try {
      const report = await generateTransactionReport(transactions);
      setReportData(report);
      setShowReportModal(true);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleGenerateReport}
        disabled={isLoading}
        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        )}
        Generate Report
      </button>

      {showReportModal && (
        <ReportModal 
          reportData={reportData} 
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </>
  );
};

export default GenerateReportButton;
