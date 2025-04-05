import { useEffect, useState } from "react";
import { useAuth } from "../hook/useAuth";
import { Navigate } from "react-router-dom";
import { FaSackDollar, FaHandHoldingDollar, FaFileInvoiceDollar, FaChartLine, FaBullseye } from "react-icons/fa6";
import Tile from "../components/TIle";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { getTransactionsByUserId } from "../services/transactionService";
import { getBudgets } from "../services/budgetService";
import { getGoalsByUserId } from "../services/goalService";

// Color array for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
const EXPENSE_COLORS = ["#FF8042", "#FFBB28", "#00C49F", "#0088FE", "#8884d8", "#82ca9d"];

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [netWorth, setNetWorth] = useState(0);

  // Chart data states
  const [incomeExpenseData, setIncomeExpenseData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [goalProgress, setGoalProgress] = useState<any[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<any[]>([]);
  const [budgetVsActualData, setBudgetVsActualData] = useState<any[]>([]);
  const [savingRate, setSavingRate] = useState(0);
  const [expenseGrowth, setExpenseGrowth] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch all needed data
        const transactionData = await getTransactionsByUserId(user);
        const budgetData = await getBudgets(user);
        const goalData = await getGoalsByUserId(user);
        
        setTransactions(transactionData);
        setBudgets(budgetData);
        setGoals(goalData);
        
        // Process transaction data for totals
        const income = transactionData
          .filter((t: any) => t.type === 'income')
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        
        const expense = transactionData
          .filter((t: any) => t.type === 'expense')
          .reduce((sum: number, t: any) => sum + t.amount, 0);
          
        setIncomeTotal(income);
        setExpenseTotal(expense);
        setNetWorth(income - expense);
        
        // Calculate saving rate
        const savingRateValue = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
        setSavingRate(savingRateValue);
        
        // Prepare chart data
        setIncomeExpenseData([
          { name: "Income", value: income },
          { name: "Expense", value: expense },
        ]);
        
        // Process category data
        const categoryMap = new Map();
        transactionData
          .filter((t: any) => t.type === 'expense')
          .forEach((t: any) => {
            const current = categoryMap.get(t.category) || 0;
            categoryMap.set(t.category, current + t.amount);
          });
        
        const categoryChartData = Array.from(categoryMap.entries())
          .map(([category, amount]) => ({
            name: category,
            value: amount,
          }))
          .sort((a, b) => b.value - a.value); // Sort by value descending
        
        setCategoryData(categoryChartData);
        
        // Process goal progress
        const goalProgressData = goalData.map((goal: any) => ({
          name: goal.goalName,
          current: goal.currentAmount,
          target: goal.targetAmount,
          percentage: Math.round((goal.currentAmount / goal.targetAmount) * 100),
        })).slice(0, 5); // Only show top 5 goals
        
        setGoalProgress(goalProgressData);
        
        // Generate monthly trend data
        const monthlyData = generateMonthlyTrendData(transactionData);
        setMonthlyTrendData(monthlyData);
        
        // Calculate month-over-month expense growth
        if (monthlyData.length >= 2) {
          const currentMonth = monthlyData[monthlyData.length - 1].expenses;
          const prevMonth = monthlyData[monthlyData.length - 2].expenses;
          const growth = prevMonth > 0 ? ((currentMonth - prevMonth) / prevMonth) * 100 : 0;
          setExpenseGrowth(Math.round(growth * 10) / 10);
        }
        
        // Process budget vs actual data
        const budgetComparison = budgetData.map((budget: any) => ({
          name: budget.title || budget.name || budget.category,
          budget: budget.amount,
          actual: budget.spent || 0,
          percentUsed: budget.percentageUsed || Math.round((budget.spent / budget.amount) * 100)
        })).slice(0, 5); // Only top 5 budgets
        
        setBudgetVsActualData(budgetComparison);
        
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Helper function to generate monthly trend data
  const generateMonthlyTrendData = (transactionData: any[]) => {
    const monthlyMap = new Map();
    
    transactionData.forEach((transaction: any) => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      if (!monthlyMap.has(monthYear)) {
        monthlyMap.set(monthYear, { 
          name: monthName,
          income: 0, 
          expenses: 0,
          savings: 0
        });
      }
      
      const monthData = monthlyMap.get(monthYear);
      if (transaction.type === 'income') {
        monthData.income += transaction.amount;
      } else {
        monthData.expenses += transaction.amount;
      }
      monthData.savings = monthData.income - monthData.expenses;
    });
    
    // Convert to array and sort by month/year
    return Array.from(monthlyMap.values());
  };

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3">Loading dashboard data...</span>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value}%`;
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Financial Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(incomeTotal)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FaFileInvoiceDollar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(expenseTotal)}</p>
                <p className={`text-xs mt-1 ${expenseGrowth > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {expenseGrowth > 0 ? '↑' : '↓'} {Math.abs(expenseGrowth)}% from last month
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <FaHandHoldingDollar className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Net Worth</p>
                <p className={`text-2xl font-bold ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(netWorth)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FaSackDollar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Saving Rate</p>
                <p className="text-2xl font-bold text-indigo-600">{formatPercentage(savingRate)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {savingRate >= 20 ? 'Excellent' : savingRate >= 10 ? 'Good' : 'Needs improvement'}
                </p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-lg">
                <FaChartLine className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Monthly Financial Trends</h2>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#0088FE" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#FF8042" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" />
            <YAxis />
            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Legend />
            <Area type="monotone" dataKey="income" stroke="#0088FE" fillOpacity={1} fill="url(#colorIncome)" />
            <Area type="monotone" dataKey="expenses" stroke="#FF8042" fillOpacity={1} fill="url(#colorExpenses)" />
            <Area type="monotone" dataKey="savings" stroke="#82ca9d" fillOpacity={1} fill="url(#colorSavings)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Income vs Expense Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Income vs Expense</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incomeExpenseData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                strokeWidth={2}
              >
                {incomeExpenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Income</p>
              <p className="text-lg font-bold text-blue-600">{formatCurrency(incomeTotal)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">Expenses</p>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(expenseTotal)}</p>
            </div>
          </div>
        </div>

        {/* Expense Breakdown Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Top Expense Categories</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData.slice(0, 6)} // Show only top 6 categories
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                strokeWidth={1}
              >
                {categoryData.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget vs Actual */}
      {budgetVsActualData.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Budget vs Actual Spending</h2>
            <span className="text-sm text-gray-500">Top 5 categories</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={budgetVsActualData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barSize={40}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Legend />
              <Bar name="Budget" dataKey="budget" fill="#8884d8" />
              <Bar name="Actual" dataKey="actual" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {budgetVsActualData.map((item, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-xs font-medium ${
                    item.percentUsed > 100 ? 'text-red-600' : item.percentUsed > 80 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {item.percentUsed}% used
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.percentUsed > 100 ? 'bg-red-600' : item.percentUsed > 80 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Spent: {formatCurrency(item.actual)}</span>
                  <span>Budget: {formatCurrency(item.budget)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals Progress */}
      {goalProgress.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Financial Goals Progress</h2>
            <div className="bg-indigo-100 p-2 rounded-lg">
              <FaBullseye className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={goalProgress}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                barSize={30}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar name="Current Amount" dataKey="current" fill="#82ca9d" />
                <Bar name="Target Amount" dataKey="target" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            
            {/* Progress percentages */}
            <div className="space-y-4">
              {goalProgress.map((goal, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-gray-800">{goal.name}</span>
                    <span className={`font-medium ${
                      goal.percentage >= 90 ? 'text-green-600' : goal.percentage >= 50 ? 'text-blue-600' : 'text-indigo-600'
                    }`}>{goal.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        goal.percentage >= 90 ? 'bg-green-600' : goal.percentage >= 50 ? 'bg-blue-600' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${goal.percentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">{formatCurrency(goal.current)}</span>
                    <span className="text-gray-500">Target: {formatCurrency(goal.target)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-700">Recent Transactions</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.slice(0, 5).map((transaction, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+ Income' : '- Expense'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                      {transaction.description || 'No description'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;