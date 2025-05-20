import { useForm } from "react-hook-form";
import { useEffect } from "react";

interface Goal {
  _id?: string;
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
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<Goal>({
    defaultValues: {
      goalName: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date().toISOString().split('T')[0],
      status: 'in progress',
      notes: ''
    }
  });

  // Watch the currentAmount and targetAmount for validation logic
  const currentAmount = watch('currentAmount');
  const targetAmount = watch('targetAmount');

  useEffect(() => {
    if (initialData) {
      // Format date properly for date input (YYYY-MM-DD)
      let formattedDate;
      try {
        // Handle potential invalid date strings
        const dateObj = new Date(initialData.deadline);
        // Check if date is valid
        if (!isNaN(dateObj.getTime())) {
          formattedDate = dateObj.toISOString().split('T')[0];
        } else {
          // Fallback to current date if invalid
          formattedDate = new Date().toISOString().split('T')[0];
        }
      } catch (error) {
        console.error("Error parsing date:", error);
        // Fallback to current date if error
        formattedDate = new Date().toISOString().split('T')[0];
      }

      // Reset form with properly parsed values
      reset({
        goalName: initialData.goalName,
        targetAmount: Number(initialData.targetAmount),
        currentAmount: Number(initialData.currentAmount),
        deadline: formattedDate,
        status: initialData.status,
        notes: initialData.notes || '',
      });
    }
  }, [initialData, reset]);

  // Auto-update the status based on current and target amount
  useEffect(() => {
    // If current amount >= target amount, auto-set status to achieved
    if (Number(currentAmount) >= Number(targetAmount) && Number(targetAmount) > 0) {
      setValue('status', 'achieved');
    } 
    // If current amount < target amount and status is 'achieved', reset to 'in progress'
    else if (watch('status') === 'achieved' && Number(currentAmount) < Number(targetAmount)) {
      setValue('status', 'in progress');
    }
  }, [currentAmount, targetAmount, setValue, watch]);

  const onSubmit = (data: Goal) => {
    onSave(data); // Call parent function to save data
    reset();
    onClose(); // Close modal after saving
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Add Financial Goal</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Goal Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Goal Name</label>
            <input
              type="text"
              {...register("goalName", { required: "Goal name is required" })}
              className="mt-1 p-2 w-full border rounded-lg"
            />
            {errors.goalName && <p className="text-red-500 text-sm">{errors.goalName.message}</p>}
          </div>

          {/* Target Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Target Amount</label>
            <input
              type="number"
              {...register("targetAmount", { required: "Target amount is required", min: 1 })}
              className="mt-1 p-2 w-full border rounded-lg"
            />
            {errors.targetAmount && <p className="text-red-500 text-sm">{errors.targetAmount.message}</p>}
          </div>

          {/* Current Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Current Amount</label>
            <input
              type="number"
              {...register("currentAmount", { required: "Current amount is required", min: 0 })}
              className="mt-1 p-2 w-full border rounded-lg"
            />
            {errors.currentAmount && <p className="text-red-500 text-sm">{errors.currentAmount.message}</p>}
          </div>

          {/* Deadline */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Deadline</label>
            <input
              type="date"
              {...register("deadline", { required: "Deadline is required" })}
              className="mt-1 p-2 w-full border rounded-lg"
            />
            {errors.deadline && <p className="text-red-500 text-sm">{errors.deadline.message}</p>}
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              {...register("status", { 
                required: "Status is required",
                validate: {
                  achievedValidation: value => {
                    // Check if trying to set status to achieved but current < target
                    if (value === 'achieved' && Number(currentAmount) < Number(targetAmount)) {
                      return "Cannot mark as achieved when current amount is less than target amount";
                    }
                    return true;
                  }
                }
              })}
              className="mt-1 p-2 w-full border rounded-lg"
              disabled={Number(currentAmount) >= Number(targetAmount)} // Disable if goal is already achieved
            >
              <option value="in progress">In Progress</option>
              <option value="achieved">Achieved</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            {Number(currentAmount) >= Number(targetAmount) && (
              <p className="text-green-600 text-sm mt-1">
                Goal automatically marked as achieved because current amount meets or exceeds target
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              {...register("notes")}
              className="mt-1 p-2 w-full border rounded-lg"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
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
