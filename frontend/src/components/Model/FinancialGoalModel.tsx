import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

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
  // Store raw form values for debugging
  const [rawFormValues, setRawFormValues] = useState({
    targetAmount: 0,
    currentAmount: 0
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues
  } = useForm<Goal>({
    defaultValues: {
      goalName: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date().toISOString().split('T')[0],
      status: 'in progress',
      notes: '',
    },
    mode: 'onChange'
  });

  // Set up progress calculation based on current form values
  const currentAmount = parseFloat(watch('currentAmount')?.toString() || '0');
  const targetAmount = parseFloat(watch('targetAmount')?.toString() || '0');
  const progress = targetAmount > 0 ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100) : 0;
  
  // Progress bar color based on completion percentage
  const getProgressColor = (percent: number) => {
    if (percent < 25) return 'bg-red-500';
    if (percent < 50) return 'bg-yellow-500';
    if (percent < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  useEffect(() => {
    // If initialData is provided, set form values
    if (initialData) {
      // First log the raw initial data for debugging
      console.log('Initial data received:', initialData);
      
      try {
        // Format date properly for date input (YYYY-MM-DD)
        const formattedDate = initialData.deadline 
          ? new Date(initialData.deadline).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0];

        // Handle nested or complex data types by accessing properties directly
        // For numeric values, explicitly parse as numbers to avoid string issues
        const parsedTargetAmount = parseFloat(String(initialData.targetAmount || 0));
        const parsedCurrentAmount = parseFloat(String(initialData.currentAmount || 0));
        
        // Log parsed values for debugging
        console.log('Parsed numeric values:', {
          targetAmount: parsedTargetAmount,
          currentAmount: parsedCurrentAmount,
          originalTargetType: typeof initialData.targetAmount,
          originalCurrentType: typeof initialData.currentAmount
        });
        
        // Store raw values for debugging
        setRawFormValues({
          targetAmount: parsedTargetAmount,
          currentAmount: parsedCurrentAmount
        });

        // Use a complete reset to ensure all values are set correctly at once
        reset({
          goalName: initialData.goalName || '',
          targetAmount: parsedTargetAmount,
          currentAmount: parsedCurrentAmount,
          deadline: formattedDate,
          status: initialData.status || 'in progress',
          notes: initialData.notes || '',
          _id: initialData._id
        });
        
        // Double-check the form values after setting
        setTimeout(() => {
          const formValues = getValues();
          console.log('Form values after setting:', formValues);
        }, 100);
      } catch (error) {
        console.error('Error setting form values:', error);
      }
    }
  }, [initialData, reset, setValue, getValues]);

  const submitHandler = (data: Goal) => {
    // Ensure amounts are passed as numbers
    const formData = {
      ...data,
      targetAmount: parseFloat(data.targetAmount?.toString() || '0'),
      currentAmount: parseFloat(data.currentAmount?.toString() || '0'),
    };
    
    console.log('Submitting form data:', formData);
    console.log('Original raw values were:', rawFormValues);
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-3">
          {initialData?._id ? 'Edit Financial Goal' : 'Create New Financial Goal'}
        </h2>
        
        {/* Add debug section during development - can be removed later */}
        <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
          <div>Raw targetAmount: {rawFormValues.targetAmount}</div>
          <div>Raw currentAmount: {rawFormValues.currentAmount}</div>
          <div>Form targetAmount: {getValues('targetAmount')}</div>
          <div>Form currentAmount: {getValues('currentAmount')}</div>
        </div>
        
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <input
              type="text"
              {...register('goalName', { 
                required: 'Goal name is required',
                minLength: { value: 3, message: 'Goal name must be at least 3 characters' }
              })}
              className={`w-full border ${errors.goalName ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="e.g. Emergency Fund"
            />
            {errors.goalName && <p className="mt-1 text-sm text-red-600">{errors.goalName.message}</p>}
          </div>
          
          {/* Target Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount</label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                {...register('targetAmount', { 
                  required: 'Target amount is required',
                  min: { value: 0.01, message: 'Target amount must be greater than 0' },
                  setValueAs: value => parseFloat(value) || 0
                })}
                className={`block w-full rounded-md pl-7 pr-12 ${errors.targetAmount ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
              />
            </div>
            {errors.targetAmount && <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>}
          </div>
          
          {/* Current Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                {...register('currentAmount', { 
                  required: 'Current amount is required',
                  min: { value: 0, message: 'Current amount cannot be negative' },
                  setValueAs: value => parseFloat(value) || 0
                })}
                className={`block w-full rounded-md pl-7 pr-12 ${errors.currentAmount ? 'border-red-500' : 'border-gray-300'} focus:border-blue-500 focus:ring-blue-500`}
              />
            </div>
            {errors.currentAmount && <p className="mt-1 text-sm text-red-600">{errors.currentAmount.message}</p>}
          </div>
          
          {/* Progress Preview */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${getProgressColor(progress)} transition-all duration-300`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
          
          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
            <input
              type="date"
              {...register('deadline', { required: 'Deadline is required' })}
              className={`w-full border ${errors.deadline ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>}
          </div>
          
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              {...register('status', { required: 'Status is required' })}
              className={`w-full border ${errors.status ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="in progress">In Progress</option>
              <option value="achieved">Achieved</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-between space-x-3 pt-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              onClick={() => {
                console.log('Current form values on cancel:', getValues());
                onClose();
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {initialData?._id ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialGoalModal;