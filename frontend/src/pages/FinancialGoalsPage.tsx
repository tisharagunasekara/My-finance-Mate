import { useEffect, useState } from 'react';
import { useAuth } from '../hook/useAuth';
import { getGoalsByUserId, deleteGoal, createGoal, updateGoal } from '../services/goalService';
import FinancialGoalModal from '../components/Model/FinancialGoalModel';
import ReusableTable from '../components/Table';
import Button from '../components/Button';

interface Goal {
  _id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
  notes?: string;
}

const columns = [
  { key: 'goalName', label: 'Goal Name', sortable: true },
  { key: 'targetAmount', label: 'Target Amount', sortable: true },
  { key: 'currentAmount', label: 'Current Amount', sortable: true },
  { key: 'deadline', label: 'Deadline', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
];

const FinancialGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const fetchGoals = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getGoalsByUserId(user);
      setGoals(data);
    } catch (err) {
      setError('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

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
      if (selectedGoal) {
        // Update existing goal
        const updatedGoal = await updateGoal(selectedGoal._id, data);
        setGoals(goals.map(goal => 
          goal._id === selectedGoal._id ? updatedGoal : goal
        ));
      } else {
        // Create new goal
        const newGoal = await createGoal(user!, data);
        setGoals([...goals, newGoal]);
      }
      setIsModalOpen(false);
      setSelectedGoal(null);
    } catch (err) {
      setError('Failed to save goal');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Financial Goals</h1>
        <Button
          text="Add New Goal"
          onClick={() => {
            setSelectedGoal(null);
            setIsModalOpen(true);
          }}
        />
      </div>

      {loading && <p>Loading goals...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <ReusableTable
        columns={columns}
        data={goals}
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