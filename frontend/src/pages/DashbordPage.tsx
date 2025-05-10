import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { FaSackDollar, FaHandHoldingDollar, FaFileInvoiceDollar } from "react-icons/fa6";
import Tile from "../components/Tile";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { COLORS } from "../dummuData/sampleData";
import { getTransactionsByUserId } from "../services/transactionService";
import { getBudgets } from "../services/budgetService";
import { getGoalsByUserId } from "../services/goalService";

// Define interface for transaction data
interface Transaction {
  _id: string;
  userId: string;
  type: string;
  category: string;
  amount: number;
  date: string;
  description?: string;
  notes?: string;
}

// Define interface for budget data
interface Budget {
  _id: string;
  name: string;
  amount: number;
  spent: number;
  percentageUsed: number;
  category?: string;
  title?: string;
}

// Define interface for goal data
interface Goal {
  _id: string;
  userId: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
}

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Summary state
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [netWorth, setNetWorth] = useState<number>(0);
  
  // Chart data states
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch transactions, budgets, and goals
        const transactionsData = await getTransactionsByUserId(user);
        const budgetsData = await getBudgets(user);
        const goalsData = await getGoalsByUserId(user);
        
        // Store fetched data
        setTransactions(transactionsData);
        setBudgets(budgetsData);
        setGoals(goalsData);
        
        // Process data for summaries and charts
        processTransactionData(transactionsData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);
  
  const processTransactionData = (transactions: Transaction[]) => {
    // Calculate total income and expense
    let income = 0;
    let expense = 0;
    const categoryAmounts: {[key: string]: number} = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        income += transaction.amount;
      } else {
        expense += transaction.amount;
        
        // Aggregate expenses by category
        if (!categoryAmounts[transaction.category]) {
          categoryAmounts[transaction.category] = 0;
        }
        categoryAmounts[transaction.category] += transaction.amount;
      }
    });
    
    // Set summary values
    setTotalIncome(income);
    setTotalExpense(expense);
    setNetWorth(income - expense);
    
    // Prepare chart data
    setIncomeExpenseData([
      { name: 'Income', value: income },
      { name: 'Expense', value: expense }
    ]);
    
    // Process category data for pie chart
    const categoryChartData = Object.keys(categoryAmounts).map(category => ({
      name: category,
      value: categoryAmounts[category]
    }));
    
    setCategoryData(categoryChartData);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-blue-500 font-medium">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Dashboard</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Tile 
            title="Total Income" 
            count={totalIncome} 
            icon={FaFileInvoiceDollar} 
            formatter={formatCurrency}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-b-4 border-green-500"
          />
          <Tile 
            title="Total Expense" 
            count={totalExpense} 
            icon={FaHandHoldingDollar} 
            formatter={formatCurrency}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-b-4 border-red-500"
          />
          <Tile 
            title="Net Worth" 
            count={netWorth} 
            icon={FaSackDollar} 
            formatter={formatCurrency}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border-b-4 border-blue-500"
          />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Income & Expense Chart Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <span className="w-2 h-6 bg-indigo-500 rounded-full mr-3"></span>
              Income and Expense
            </h2>
            <div className="h-80">
              {incomeExpenseData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeExpenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {incomeExpenseData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? "#10B981" : "#EF4444"} 
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">No transaction data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Expense Breakdown Chart Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
              Expense Breakdown
            </h2>
            <div className="h-80">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-400">No expense category data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Recent Transactions & Budgets Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Recent Transactions */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
                Recent Transactions
              </h2>
              <button 
                onClick={() => navigate('/transaction')}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            
            {transactions.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {transactions.slice(0, 5).map(transaction => (
                  <div key={transaction._id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium capitalize">{transaction.category}</p>
                      <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">No transaction data available</p>
            )}
          </div>
          
          {/* Budget Overview */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                <span className="w-2 h-6 bg-green-500 rounded-full mr-3"></span>
                Budget Overview
              </h2>
              <button 
                onClick={() => navigate('/budgets')}
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {budgets.slice(0, 4).map(budget => {
                  const percentage = budget.percentageUsed || 0;
                  let progressColor = "bg-blue-500";
                  
                  if (percentage >= 90) {
                    progressColor = "bg-red-500";
                  } else if (percentage >= 70) {
                    progressColor = "bg-yellow-500";
                  }
                  
                  return (
                    <div key={budget._id}>
                      <div className="flex justify-between mb-1">
                        <p className="font-medium">{budget.title || budget.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${progressColor} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">No budget data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;