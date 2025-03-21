import { useState, useEffect } from 'react';

interface Goal {
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
  notes?: string;
}

interface FinancialGoalModalProps {
  onClose: () => void;
  onSave: (data: Goal) => void;
  initialData?: Goal | null;
}

const FinancialGoalModal = ({ onClose, onSave, initialData }: FinancialGoalModalProps) => {
  const [formData, setFormData] = useState<Goal>({
    goalName: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    status: 'in progress',
    notes: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('Amount') ? parseFloat(value) : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'Edit Financial Goal' : 'Create New Financial Goal'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Goal Name</label>
            <input
              type="text"
              name="goalName"
              value={formData.goalName}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Target Amount</label>
            <input
              type="number"
              name="targetAmount"
              value={formData.targetAmount}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block mb-1">Current Amount</label>
            <input
              type="number"
              name="currentAmount"
              value={formData.currentAmount}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
              min="0"
            />
          </div>
          <div>
            <label className="block mb-1">Deadline</label>
            <input
              type="date"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded p-2"
            >
              <option value="in progress">In Progress</option>
              <option value="achieved">Achieved</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialGoalModal;