import { useEffect, useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { getGoalsByUserId, deleteGoal, createGoal, updateGoal } from '../services/goalService';
import FinancialGoalModal from '../components/Model/FinancialGoalModel';
import ReusableTable from '../components/Table';
import Button from '../components/Button';
import { FaSearch, FaFileDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { downloadGoalsReport } from '../services/goalReportService';

interface Goal {
  _id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
  notes?: string;
  progressPercentage?: number; // Added progress percentage property
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

  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getGoalsByUserId(user);
      // Calculate progress percentage for each goal
      const goalsWithProgress = data.map(goal => ({
        ...goal,
        progressPercentage: (goal.currentAmount / goal.targetAmount) * 100
      }));
      setGoals(goalsWithProgress);
      setFilteredGoals(goalsWithProgress);
    } catch (err) {
      setError('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  useEffect(() => {
    // Filter goals based on search query
    if (searchQuery.trim() === '') {
      setFilteredGoals(goals);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = goals.filter(
        goal => 
          goal.goalName.toLowerCase().includes(lowerCaseQuery) || 
          goal.status.toLowerCase().includes(lowerCaseQuery) ||
          (goal.notes && goal.notes.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredGoals(filtered);
    }
  }, [searchQuery, goals]);

  const handleDelete = async (goalId: string) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteGoal(goalId);
        setGoals(goals.filter(goal => goal._id !== goalId));
      } catch (err) {
        setError('Failed to delete goal');
      }
    }
  };

  const handleEdit = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleSave = async (data: Omit<Goal, '_id'>) => {
    try {
      // Validate deadline is not in the past
      const selectedDate = new Date(data.deadline);
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison
      
      if (selectedDate < currentDate) {
        setError('Deadline cannot be in the past');
        toast.error('Please select a future date for your goal deadline');
        return;
      }
      
      if (selectedGoal) {
        // Update existing goal
        const updatedGoal = await updateGoal(selectedGoal._id, data);
        // Calculate progress percentage
        const goalWithProgress = {
          ...updatedGoal,
          progressPercentage: (updatedGoal.currentAmount / updatedGoal.targetAmount) * 100
        };
        setGoals(goals.map(goal => 
          goal._id === selectedGoal._id ? goalWithProgress : goal
        ));
      } else {
        // Create new goal
        const newGoal = await createGoal(user!, data);
        // Calculate progress percentage for new goal
        const newGoalWithProgress = {
          ...newGoal,
          progressPercentage: (newGoal.currentAmount / newGoal.targetAmount) * 100
        };
        setGoals([...goals, newGoalWithProgress]);
      }
      setIsModalOpen(false);
      setSelectedGoal(null);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError('Failed to save goal');
    }
  };

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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Goals</h1>
        <div className="flex gap-4">
          <Button
            text="Generate Report"
            icon={<FaFileDownload />}
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || goals.length === 0}
            className={`${isGeneratingReport ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
          <Button
            text="Add New Goal"
            onClick={() => {
              setSelectedGoal(null);
              setIsModalOpen(true);
            }}
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search goals by name, status or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {loading && <p>Loading goals...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {filteredGoals.length === 0 && !loading ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {goals.length === 0 
              ? "No financial goals found. Create your first goal!" 
              : "No goals match your search criteria."
            }
          </p>
        </div>
      ) : (
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
                  goal.status.toLowerCase() === 'completed' ? 'bg-green-100 text-green-800' :
                  goal.status.toLowerCase() === 'in progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}
              >
                {goal.status}
              </span>
            )
          }))}
          actions={(row) => (
            <div className="flex gap-2">
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handleEdit(row)}
              >
                Edit
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDelete(row._id)}
              >
                Delete
              </button>
            </div>
          )}
        />
      )}

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