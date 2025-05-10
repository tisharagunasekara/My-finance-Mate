import { useState, useEffect } from 'react';
import { useAuth } from '../hook/useAuth';
import { getTransactionsByUserId } from '../services/transactionService';
import ReusableTable from '../components/Table';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { COLORS } from '../dummuData/sampleData';
import Button from '../components/Button';
import { downloadAutomatedBudgetPlanAsPDF } from '../services/reportService';
import { toast } from 'react-toastify';

// Type definitions for the component
// Structure for a single transaction
interface Transaction {
  _id: string;
  userId: string;
  type: string;
  category: string;
  amount: number;
  date: string;
}

// Structure for storing category spending data and budget recommendations
interface CategorySummary {
  category: string;
  totalSpent: number;
  percentage: number;
  recommendedBudget: number;
}

// Structure for the complete budget plan
interface AutoBudgetPlan {
  monthlyIncome: number;
  essentials: number;    // 50% of income
  savings: number;       // 20% of income
  discretionary: number; // 30% of income
  categoryBreakdown: CategorySummary[];
}

/**
 * AutomatedBudgetPage - Creates an automated budget plan based on the 50/30/20 rule
 * and the user's transaction history
 */
const AutomatedBudgetPage = () => {
  const { user } = useAuth();
  
  // State management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [budgetPlan, setBudgetPlan] = useState<AutoBudgetPlan | null>(null);
  const [income, setIncome] = useState<number>(0);
  const [analyzing, setAnalyzing] = useState<boolean>(false); // New state for analysis loading
  const [isDownloading, setIsDownloading] = useState<boolean>(false); // New state for PDF download
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'essential' | 'discretionary'>('all'); // Add state for filter
  
  // Define table columns for the category breakdown
  const columns = [
    { key: "category", label: "Category", sortable: true },
    { key: "totalSpent", label: "Current Spending", sortable: true },
    { key: "percentage", label: "% of Budget", sortable: true },
    { key: "recommendedBudget", label: "Recommended Budget", sortable: true },
  ];

  /**
   * Fetch user's transaction history when the component mounts
   * Calculate total income from the transactions
   */
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get all transactions for the current user
        const data: Transaction[] = await getTransactionsByUserId(user);
        setTransactions(data);
        
        // Calculate total income from transaction history
        const totalIncome = data
          .filter(t => t.type === 'income')
          .reduce((sum: number, t) => sum + t.amount, 0);
        setIncome(totalIncome);
        
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to fetch transaction data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [user]);
  
  /**
   * Generate a budget plan based on user's income and spending patterns
   * Uses the 50/30/20 rule (50% essentials, 30% discretionary, 20% savings)
   */
  const generateBudgetPlan = () => {
    // Validate we have enough data to generate a plan
    if (transactions.length === 0 || income === 0) {
      setError('Not enough data to generate a budget plan');
      return;
    }
    
    // Set analyzing state to true to show loading screen
    setAnalyzing(true);
    
    // Using setTimeout to simulate analysis time and show the loading screen
    setTimeout(() => {
      try {
        // Filter out only expense transactions
        const expenses = transactions.filter(t => t.type === 'expense');
        
        // Group expenses by category and sum amounts
        const categoryMap = new Map<string, number>();
        expenses.forEach(expense => {
          const current = categoryMap.get(expense.category) || 0;
          categoryMap.set(expense.category, current + expense.amount);
        });
        
        // Calculate total expense amount across all categories
        const totalExpense = Array.from(categoryMap.values()).reduce((sum, amount) => sum + amount, 0);
        
        // Apply the 50/30/20 rule to the monthly income
        const essentials = income * 0.5;
        const discretionary = income * 0.3;
        const savings = income * 0.2;
        
        // Generate detailed breakdown for each spending category
        const categoryBreakdown: CategorySummary[] = Array.from(categoryMap.entries()).map(([category, totalSpent]) => {
          // Calculate what percentage of total spending this category represents
          const percentage = (totalSpent / totalExpense) * 100;
          
          // Determine if this is an essential or discretionary expense
          // This is a simplified approach - a real app might have a more sophisticated categorization
          const isEssential = ['rent', 'groceries', 'utilities', 'transportation', 'healthcare'].includes(category.toLowerCase());
          
          // Calculate recommended budget based on category type
          // Allocate from either the essentials or discretionary bucket based on category type
          const recommendedBudget = isEssential 
            ? (totalSpent / totalExpense) * essentials 
            : (totalSpent / totalExpense) * discretionary;
            
          return {
            category,
            totalSpent,
            percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
            recommendedBudget: Math.round(recommendedBudget * 100) / 100 // Round to 2 decimal places
          };
        });
        
        // Sort categories by spending amount (highest to lowest)
        categoryBreakdown.sort((a, b) => b.totalSpent - a.totalSpent);
        
        // Set the complete budget plan
        setBudgetPlan({
          monthlyIncome: income,
          essentials,
          savings,
          discretionary,
          categoryBreakdown
        });
      } catch (err) {
        console.error("Error generating budget plan:", err);
        setError("Failed to generate budget plan. Please try again.");
      } finally {
        setAnalyzing(false); // End the analyzing state
      }
    }, 2000); // Simulate 2 seconds of analysis time
  };
  
  /**
   * Handle downloading the budget plan as PDF
   */
  const handleDownloadPDF = async () => {
    if (!budgetPlan) return;
    
    setIsDownloading(true);
    try {
      await downloadAutomatedBudgetPlanAsPDF(budgetPlan);
      toast.success('Budget plan PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Format a number as USD currency string
   * @param value - The number to format as currency
   * @returns Formatted currency string (e.g., "$1,234.56")
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };
  
  // Prepare data for the pie chart visualization
  const pieChartData = budgetPlan ? [
    { name: 'Essentials (50%)', value: budgetPlan.essentials },
    { name: 'Discretionary (30%)', value: budgetPlan.discretionary },
    { name: 'Savings (20%)', value: budgetPlan.savings }
  ] : [];

  // Get filtered categories based on current filter
  const getFilteredCategories = () => {
    if (!budgetPlan || categoryFilter === 'all') {
      return budgetPlan?.categoryBreakdown || [];
    }
    
    const essentialCategories = ['rent', 'groceries', 'utilities', 'transportation', 'healthcare'];
    
    return budgetPlan.categoryBreakdown.filter(item => {
      const isEssential = essentialCategories.includes(item.category.toLowerCase());
      return categoryFilter === 'essential' ? isEssential : !isEssential;
    });
  };
  
  // Calculate budget health metrics
  const calculateBudgetHealth = () => {
    if (!budgetPlan) return { status: 'unknown', score: 0, message: '' };
    
    // Basic score calculation based on spending patterns
    let score = 100;
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalSpent = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Penalize if spending is greater than income
    if (totalSpent > budgetPlan.monthlyIncome) {
      score -= 30;
    }
    
    // Analyze category distribution
    const essentialCategories = ['rent', 'groceries', 'utilities', 'transportation', 'healthcare'];
    const essentialSpending = expenses
      .filter(t => essentialCategories.includes(t.category.toLowerCase()))
      .reduce((sum, t) => sum + t.amount, 0);
    
    const essentialRatio = essentialSpending / totalSpent;
    
    // Ideal is close to 50% for essentials
    if (essentialRatio > 0.7) {
      score -= 15; // Too much on essentials
    } else if (essentialRatio < 0.3) {
      score -= 10; // Too little on essentials
    }
    
    // Determine status and message based on score
    let status = 'excellent';
    let message = 'Your budget allocation is well-balanced.';
    
    if (score < 50) {
      status = 'poor';
      message = 'Your spending patterns need significant adjustments.';
    } else if (score < 70) {
      status = 'fair';
      message = 'There are several areas where your budget could be improved.';
    } else if (score < 90) {
      status = 'good';
      message = 'Your budget is on track with minor adjustments needed.';
    }
    
    return { status, score, message };
  };
  
  const budgetHealth = calculateBudgetHealth();
  
  // Component UI rendering
  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Modern Header with Gradient Background */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 mb-8 shadow-xl text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Smart Budget Planner</h1>
            <p className="text-blue-100 max-w-2xl">
              Our AI analyzes your spending patterns and creates a personalized 50/30/20 budget plan 
              to optimize your financial health.
            </p>
          </div>
          {budgetPlan && (
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="mt-4 md:mt-0 flex items-center px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-blue-50 transition-colors disabled:bg-gray-200 disabled:text-gray-500 font-medium shadow-md hover:shadow-lg"
            >
              {isDownloading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Report...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Export Detailed Report
                </>
              )}
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-lg text-gray-700">Loading your transaction data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded-lg mb-6 shadow-md">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {analyzing ? (
            // Enhanced Analyzing Loading Screen
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50"></div>
              
              <div className="relative flex flex-col items-center justify-center space-y-8 py-12">
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-blue-100 rounded-full animate-spin"></div>
                  <div className="w-24 h-24 border-t-4 border-blue-600 rounded-full animate-spin absolute top-0"></div>
                  <div className="w-24 h-24 border-r-4 border-indigo-500 rounded-full animate-spin absolute top-0" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-800 mt-6">Analyzing Your Financial Data</h2>
                <p className="text-gray-500 max-w-lg mx-auto">
                  Our AI is processing your transaction history and creating a personalized budget recommendation based on the 50/30/20 rule.
                </p>
                
                <div className="space-y-6 w-full max-w-md mt-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center mr-3 rounded-full bg-blue-600">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Processing transactions</span>
                        <span className="text-sm font-medium text-blue-600">80%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{width: '80%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center mr-3 rounded-full bg-green-500">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Building allocation model</span>
                        <span className="text-sm font-medium text-green-500">60%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center mr-3 rounded-full bg-indigo-500">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Generating insights</span>
                        <span className="text-sm font-medium text-indigo-500">40%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full animate-pulse" style={{width: '40%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : !budgetPlan ? (
            // Enhanced Input Form
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6">
                <h2 className="text-2xl font-bold text-gray-800">Generate Your Smart Budget Plan</h2>
                <p className="text-gray-600 mt-1">
                  Based on the 50/30/20 rule: 50% for essentials, 30% for wants, 20% for savings
                </p>
              </div>
              
              <div className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/2">
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Income
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          value={income}
                          onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                          className="block w-full rounded-lg py-3 pl-10 pr-12 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Enter your average monthly income after taxes</p>
                    </div>
                    
                    <Button
                      text="Generate Budget Plan"
                      onClick={generateBudgetPlan}
                      disabled={income <= 0}
                      className="w-full py-3 text-base font-medium"
                    />
                  </div>
                  
                  <div className="w-full md:w-1/2 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8">
                    <div className="bg-blue-50 rounded-xl p-5">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">About the 50/30/20 Rule</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                            <div className="absolute inset-0 rounded-full bg-blue-200"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-blue-600"></div>
                          </div>
                          <p className="ml-2"><strong>50% Needs:</strong> Essential expenses like housing, groceries, utilities</p>
                        </li>
                        <li className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                            <div className="absolute inset-0 rounded-full bg-green-200"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-green-600"></div>
                          </div>
                          <p className="ml-2"><strong>30% Wants:</strong> Non-essential spending like dining out, entertainment</p>
                        </li>
                        <li className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                            <div className="absolute inset-0 rounded-full bg-purple-200"></div>
                            <div className="absolute inset-0 rounded-full border-2 border-purple-600"></div>
                          </div>
                          <p className="ml-2"><strong>20% Savings:</strong> Emergency fund, investments, debt reduction</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Budget Health Scorecard */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6 text-white">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                      <h2 className="text-2xl font-bold">Your 50/30/20 Budget Plan</h2>
                      <p className="text-blue-100">Based on monthly income of {formatCurrency(budgetPlan.monthlyIncome)}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                      <div className="mr-3">
                        <div className="text-xs uppercase tracking-wider text-blue-100">Budget Health</div>
                        <div className="font-bold text-lg capitalize">{budgetHealth.status}</div>
                      </div>
                      <div className="h-12 w-12 rounded-full flex items-center justify-center border-4 border-white">
                        <span className="text-lg font-bold">{budgetHealth.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  {/* Budget Allocation Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 shadow-md border border-blue-200 transform transition hover:scale-105 duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Essentials</h3>
                        <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">50%</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-700 mb-2">{formatCurrency(budgetPlan.essentials)}</div>
                      <p className="text-sm text-gray-600">Housing, utilities, groceries, transportation, healthcare</p>
                      <div className="mt-4 h-2 bg-blue-200 rounded-full">
                        <div className="h-2 bg-blue-600 rounded-full w-1/2"></div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 shadow-md border border-green-200 transform transition hover:scale-105 duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Discretionary</h3>
                        <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">30%</span>
                      </div>
                      <div className="text-3xl font-bold text-green-700 mb-2">{formatCurrency(budgetPlan.discretionary)}</div>
                      <p className="text-sm text-gray-600">Dining out, entertainment, hobbies, subscriptions</p>
                      <div className="mt-4 h-2 bg-green-200 rounded-full">
                        <div className="h-2 bg-green-600 rounded-full w-3/10"></div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 shadow-md border border-purple-200 transform transition hover:scale-105 duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Savings</h3>
                        <span className="text-sm font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">20%</span>
                      </div>
                      <div className="text-3xl font-bold text-purple-700 mb-2">{formatCurrency(budgetPlan.savings)}</div>
                      <p className="text-sm text-gray-600">Emergency fund, retirement, investments, debt payoff</p>
                      <div className="mt-4 h-2 bg-purple-200 rounded-full">
                        <div className="h-2 bg-purple-600 rounded-full w-1/5"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Budget Analysis Message */}
                  <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                    <div className="flex">
                      <svg className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-blue-700">{budgetHealth.message}</p>
                    </div>
                  </div>

                  {/* Budget Visualization */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 h-80">
                      <h3 className="text-xl font-semibold mb-6 text-gray-800">Budget Allocation</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            labelLine={false}
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Legend layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6 h-80">
                      <h3 className="text-xl font-semibold mb-6 text-gray-800">Top Expense Categories</h3>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart
                          data={budgetPlan.categoryBreakdown.slice(0, 5)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="category" />
                          <YAxis tickFormatter={(value) => `$${value}`} />
                          <Tooltip formatter={(value) => formatCurrency(value as number)} />
                          <Bar dataKey="totalSpent" fill="#8884d8" name="Current Spending" />
                          <Bar dataKey="recommendedBudget" fill="#82ca9d" name="Recommended" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Category Breakdown */}
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <h2 className="text-xl font-bold text-gray-800">Category Breakdown</h2>
                    <div className="mt-3 sm:mt-0 flex space-x-2">
                      <button
                        onClick={() => setCategoryFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          categoryFilter === 'all' 
                            ? 'bg-indigo-100 text-indigo-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setCategoryFilter('essential')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          categoryFilter === 'essential' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Essentials
                      </button>
                      <button
                        onClick={() => setCategoryFilter('discretionary')}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          categoryFilter === 'discretionary' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Discretionary
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <ReusableTable
                    columns={columns}
                    data={getFilteredCategories().map(item => ({
                      ...item,
                      totalSpent: formatCurrency(item.totalSpent),
                      percentage: `${item.percentage}%`,
                      recommendedBudget: formatCurrency(item.recommendedBudget)
                    }))}
                  />
                </div>
              </div>
              
              {/* Budget Tips & Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Smart Budget Tips</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 mt-1">1</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">Keep Essential Expenses Under 50%</h3>
                        <p className="text-gray-600">Try to keep your essential expenses to about 50% of your income. This gives you flexibility for discretionary spending and savings.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 mt-1">2</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">Prioritize 20% for Financial Goals</h3>
                        <p className="text-gray-600">Always aim to save at least 20% of your income for emergency funds, retirement accounts, and paying off high-interest debt.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 mt-1">3</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">Review Your Discretionary Spending</h3>
                        <p className="text-gray-600">Review categories where you tend to overspend and look for areas to optimize. Consider using cash envelopes for problematic categories.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3 mt-1">4</span>
                      <div>
                        <h3 className="font-semibold text-gray-800">Reassess Monthly</h3>
                        <p className="text-gray-600">Review your budget performance monthly and make adjustments as needed. Your financial situation will evolve over time.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 rounded-2xl shadow-xl p-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Next Actions</h2>
                  <div className="space-y-4">
                    <button 
                      onClick={handleDownloadPDF}
                      className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Budget Report
                    </button>
                    
                    <button 
                      className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 border-indigo-300"
                      onClick={() => setBudgetPlan(null)}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Regenerate Budget Plan
                    </button>
                    
                    <div className="pt-4 border-t border-indigo-200">
                      <p className="text-sm text-indigo-700 mb-3">Based on your spending patterns, we recommend:</p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-center">
                          <svg className="w-5 h-5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Creating a dedicated emergency fund
                        </li>
                        <li className="flex items-center">
                          <svg className="w-5 h-5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Reviewing your subscription services
                        </li>
                        <li className="flex items-center">
                          <svg className="w-5 h-5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Setting up automatic transfers to savings
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AutomatedBudgetPage;
