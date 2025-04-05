import { useState, useEffect } from 'react';
import { useAuth } from '../hook/useAuth';
import { getTransactionsByUserId } from '../services/transactionService';
import ReusableTable from '../components/Table';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { COLORS } from '../dummuData/sampleData';
import Button from '../components/Button';

// Type definitions for the component
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

  // Component UI rendering
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Automated Budget Plan</h1>
      
      {loading ? (
        <p className="text-center">Loading transaction data...</p>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      ) : (
        <div className="space-y-8">
          {!budgetPlan ? (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Generate Your Smart Budget Plan</h2>
              <p className="text-gray-600 mb-6">
                Our system will analyze your transaction history and create a personalized budget plan 
                based on the 50/30/20 rule: 50% for essentials, 30% for discretionary spending, and 20% for savings.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
                <div className="w-full sm:w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Income
                  </label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div className="w-full sm:w-1/2 flex items-end">
                  <Button
                    text="Generate Budget Plan"
                    onClick={generateBudgetPlan}
                    disabled={income <= 0}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <p>* Calculations are based on your transaction history</p>
                <p>* You can adjust your monthly income if needed</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-lg col-span-2">
                  <h2 className="text-xl font-semibold mb-4">Your 50/30/20 Budget Plan</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-gray-600">Essentials (50%)</p>
                      <p className="text-2xl font-bold text-blue-600">{formatCurrency(budgetPlan.essentials)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-600">Discretionary (30%)</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(budgetPlan.discretionary)}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-gray-600">Savings (20%)</p>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(budgetPlan.savings)}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600">
                    Based on a monthly income of {formatCurrency(budgetPlan.monthlyIncome)}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-lg h-80">
                  <h2 className="text-xl font-semibold mb-4 text-center">Budget Allocation</h2>
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
                        label={({ name }) => name}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
                <ReusableTable
                  columns={columns}
                  data={budgetPlan.categoryBreakdown.map(item => ({
                    ...item,
                    totalSpent: formatCurrency(item.totalSpent),
                    percentage: `${item.percentage}%`,
                    recommendedBudget: formatCurrency(item.recommendedBudget)
                  }))}
                />
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Budget Tips</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Try to keep your essential expenses to about 50% of your income</li>
                  <li>Aim to save at least 20% of your income for emergencies and future goals</li>
                  <li>Review your discretionary spending categories to identify areas for potential savings</li>
                  <li>Consider using the envelope method for categories where you tend to overspend</li>
                </ul>
                
                <div className="mt-6">
                  <Button
                    text="Regenerate Budget Plan"
                    onClick={() => setBudgetPlan(null)}
                    variant="warning"
                  />
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
