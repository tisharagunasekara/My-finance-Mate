import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hook/useAuth';
import { getGoalsByUserId, deleteGoal, createGoal, updateGoal, getGoalsStats, GoalData } from '../services/goalService';
import FinancialGoalModal from '../components/Model/FinancialGoalModel';
import ReusableTable from '../components/Table';
import Button from '../components/Button';
import { FaSearch, FaFileDownload, FaPlus, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { downloadGoalsReport } from '../services/goalReportService';

interface Goal extends GoalData {
  progressPercentage?: number;
}

// Progress Bar Component
const ProgressBar = ({ percentage }: { percentage: number }) => {
  // Determine color based on percentage
  const getColor = (percent: number) => {
    if (percent < 25) return 'bg-red-500';
    if (percent < 50) return 'bg-yellow-500';
    if (percent < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
      <div 
        className={`h-2.5 rounded-full ${getColor(percentage)}`} 
        style={{ width: `${percentage}%` }}
      ></div>
      <div className="text-xs text-gray-600 text-right">{percentage.toFixed(0)}% Complete</div>
    </div>
  );
};

// Table columns definition
const columns = [
  { key: 'goalName', label: 'Goal Name', sortable: true },
  { key: 'targetAmount', label: 'Target Amount', sortable: true },
  { key: 'currentAmount', label: 'Current Amount', sortable: true },
  { key: 'progress', label: 'Progress', sortable: false },
  { key: 'deadline', label: 'Deadline', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

const FinancialGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch goals from API
  const fetchGoals = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getGoalsByUserId(user);
      
      // Calculate progress percentage for each goal
      const goalsWithProgress = data.map(goal => {
        const targetAmount = Number(goal.targetAmount);
        const currentAmount = Number(goal.currentAmount);
        const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
        
        return {
          ...goal,
          targetAmount,
          currentAmount,
          progressPercentage
        };
      });
      
      setGoals(goalsWithProgress);
      setFilteredGoals(goalsWithProgress);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
      setError('Failed to fetch goals. Please try again.');
      toast.error('Could not load your financial goals');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch of goals
  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Filter goals based on search query and status filter
  useEffect(() => {
    let filtered = goals;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(goal => goal.status.toLowerCase() === statusFilter.toLowerCase());
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        goal => 
          goal.goalName.toLowerCase().includes(lowerCaseQuery) || 
          (goal.notes && goal.notes.toLowerCase().includes(lowerCaseQuery))
      );
    }
    
    setFilteredGoals(filtered);
  }, [searchQuery, goals, statusFilter]);

  // Handle goal deletion
  const handleDelete = async (goalId: string) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) {
      return;
    }
    
    setLoading(true);
    try {
      await deleteGoal(goalId);
      setGoals(goals.filter(goal => goal._id !== goalId));
      toast.success('Goal successfully deleted');
    } catch (err) {
      console.error('Failed to delete goal:', err);
      toast.error('Could not delete the goal');
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with selected goal data
  const handleEdit = (goal: Goal) => {
    // Ensure we pass proper number values for targetAmount and currentAmount
    const preparedGoal = {
      ...goal,
      targetAmount: typeof goal.targetAmount === 'string' ? 
        parseFloat(goal.targetAmount.replace(/[^0-9.-]+/g, '')) : 
        Number(goal.targetAmount),
      currentAmount: typeof goal.currentAmount === 'string' ? 
        parseFloat(goal.currentAmount.replace(/[^0-9.-]+/g, '')) : 
        Number(goal.currentAmount),
    };
    
    // Log the goal data being passed to the modal
    console.log('Opening edit modal with goal data:', preparedGoal);
    
    setSelectedGoal(preparedGoal);
    setIsModalOpen(true);
  };

  // Handle saving goal data (create or update)
  const handleSave = async (data: Goal) => {
    // Log the data received from the form
    console.log('Received form data for save:', data);
    
    try {
      // Validate deadline is not in the past
      const selectedDate = new Date(data.deadline);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
      
      if (selectedDate < currentDate) {
        toast.error('Please select a future date for your goal deadline');
        return;
      }
      
      setLoading(true);
      
      if (selectedGoal && selectedGoal._id) {
        // Update existing goal
        console.log('Updating goal:', selectedGoal._id, data);
        const updatedGoal = await updateGoal(selectedGoal._id, data);
        
        // Calculate progress percentage
        const targetAmount = Number(updatedGoal.targetAmount);
        const currentAmount = Number(updatedGoal.currentAmount);
        const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
        
        const goalWithProgress = {
          ...updatedGoal,
          targetAmount,
          currentAmount,
          progressPercentage
        };
        
        setGoals(goals.map(goal => goal._id === selectedGoal._id ? goalWithProgress : goal));
        toast.success('Goal updated successfully');
      } else {
        // Create new goal
        if (!user) {
          toast.error('You must be logged in to create a goal');
          return;
        }
        
        const newGoal = await createGoal(user, data);
        
        // Calculate progress percentage for new goal
        const targetAmount = Number(newGoal.targetAmount);
        const currentAmount = Number(newGoal.currentAmount);
        const progressPercentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
        
        const newGoalWithProgress = {
          ...newGoal,
          targetAmount,
          currentAmount,
          progressPercentage
        };
        
        setGoals([...goals, newGoalWithProgress]);
        toast.success('New goal created successfully');
      }
      
      setIsModalOpen(false);
      setSelectedGoal(null);
    } catch (err) {
      console.error('Failed to save goal:', err);
      toast.error('Could not save your goal');
    } finally {
      setLoading(false);
    }
  };

  // Generate and download goals report
  const handleGenerateReport = async () => {
    if (goals.length === 0) {
      toast.warn("No goals available to generate a report");
      return;
    }

    setIsGeneratingReport(true);
    try {
      await downloadGoalsReport(goals);
      toast.success("Goals report downloaded successfully");
    } catch (error) {
      console.error("Error generating goals report:", error);
      toast.error("Failed to generate goals report");
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Financial Goals</h1>
          <p className="text-gray-600 mt-1">Track and manage your savings goals</p>
        </div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <Button
            text="Generate Report"
            icon={<FaFileDownload />}
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || goals.length === 0}
            className={`${isGeneratingReport ? 'opacity-70 cursor-not-allowed' : ''}`}
            variant="secondary"
          />
          <Button
            text="Add New Goal"
            icon={<FaPlus />}
            onClick={() => {
              setSelectedGoal(null);
              setIsModalOpen(true);
            }}
          />
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Goals</p>
          <p className="text-2xl font-bold">{goals.length}</p>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>{goals.filter(g => g.status === 'in progress').length} in progress</span>
            <span>{goals.filter(g => g.status === 'achieved').length} achieved</span>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Savings Target</p>
          <p className="text-2xl font-bold">
            {formatCurrency(goals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
          </p>
          <div className="text-xs text-gray-500 mt-2">
            Across all goals
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-500">Current Savings</p>
          <p className="text-2xl font-bold">
            {formatCurrency(goals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
          </p>
          <div className="text-xs text-gray-500 mt-2">
            {((goals.reduce((sum, goal) => sum + goal.currentAmount, 0) / goals.reduce((sum, goal) => sum + goal.targetAmount, 0)) * 100).toFixed(1)}% of total target
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-500">Remaining to Save</p>
          <p className="text-2xl font-bold">
            {formatCurrency(
              goals.reduce((sum, goal) => sum + goal.targetAmount, 0) - 
              goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
            )}
          </p>
          <div className="text-xs text-gray-500 mt-2">
            Across all goals
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">My Goals</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            {/* Status Filter */}
            <div className="flex items-center">
              <label htmlFor="status-filter" className="mr-2 text-sm text-gray-600">
                <FaFilter className="inline mr-1" />
                Status:
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md py-1 px-2 text-sm"
              >
                <option value="all">All</option>
                <option value="in progress">In Progress</option>
                <option value="achieved">Achieved</option>
              </select>
            </div>
            
            {/* Search Box */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -mt-2 text-gray-400" />
              <input
                type="text"
                placeholder="Search goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        )}
        
        {error && !loading && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {!loading && filteredGoals.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="mt-4 text-gray-500 text-lg">
              {goals.length === 0 ? "You haven't created any financial goals yet." : "No goals match your search criteria."}
            </p>
            {goals.length === 0 && (
              <Button
                text="Create Your First Goal"
                onClick={() => {
                  setSelectedGoal(null);
                  setIsModalOpen(true);
                }}
                className="mt-4"
              />
            )}
          </div>
        ) : (
          !loading && (
            <ReusableTable
              columns={columns}
              data={filteredGoals.map(goal => ({
                ...goal,
                targetAmount: formatCurrency(goal.targetAmount),
                currentAmount: formatCurrency(goal.currentAmount),
                progress: <ProgressBar percentage={goal.progressPercentage || 0} />,
                deadline: new Date(goal.deadline).toLocaleDateString(),
                status: (
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      goal.status.toLowerCase() === 'achieved' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                  </span>
                )
              }))}
              actions={(row) => (
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleEdit(row)}
                    className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row._id!)}
                    className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              )}
            />
          )
        )}
      </div>

      {/* Modal for creating/editing goals */}
      {isModalOpen && (
        <FinancialGoalModal
          onClose={() => {
            setIsModalOpen(false);
            setSelectedGoal(null);
          }}
          onSave={handleSave}
          initialData={selectedGoal}
        />
      )}
    </div>
  );
};

export default FinancialGoals;