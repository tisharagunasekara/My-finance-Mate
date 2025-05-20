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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
    trigger,
  } = useForm<Goal>({
    defaultValues: {
      goalName: '',
      targetAmount: 0,
      currentAmount: 0,
      deadline: new Date().toISOString().split('T')[0],
      status: 'in progress',
      notes: '',
    },
    mode: 'onChange' // Enable real-time validation
  });

  // Set up progress calculation based on current form values
  const currentAmount = Number(watch('currentAmount')) || 0;
  const targetAmount = Number(watch('targetAmount')) || 0;
  const progress = targetAmount > 0 ? Math.min(Math.round((currentAmount / targetAmount) * 100), 100) : 0;
  
  // Watch status field to update validation rules
  const status = watch('status');
  
  // Calculate minimum date (today) for deadline
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = today.toISOString().split('T')[0];
  
  // Auto-update status when current amount reaches or exceeds target amount
  useEffect(() => {
    if (currentAmount >= targetAmount && targetAmount > 0) {
      setValue('status', 'achieved');
      trigger('status');
    } else if (status === 'achieved' && currentAmount < targetAmount) {
      setValue('status', 'in progress');
      trigger('status');
    }
  }, [currentAmount, targetAmount, setValue, status, trigger]);
  
  useEffect(() => {
    if (initialData) {
      console.log('Setting initial form data:', initialData);
      
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

  const onSubmitForm = (data: Goal) => {
    // Ensure numeric values are properly formatted
    const formattedData = {
      ...data,
      targetAmount: Number(data.targetAmount),
      currentAmount: Number(data.currentAmount),
    };

    // If editing, include the original ID
    if (initialData?._id) {
      formattedData._id = initialData._id;
    }
    
    console.log('Submitting form with data:', formattedData);
    onSave(formattedData);
  };

  // Progress bar color based on completion percentage
  const getProgressColor = (percent: number) => {
    if (percent < 25) return 'bg-red-500';
    if (percent < 50) return 'bg-yellow-500';
    if (percent < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Calculate remaining amount
  const remainingAmount = Math.max(0, targetAmount - currentAmount);
  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh]">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 -m-6 mb-6 p-6 pb-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">
              {initialData?._id ? 'Edit Financial Goal' : 'Create New Goal'}
            </h2>
            <button 
              className="text-white hover:text-gray-200 focus:outline-none"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-5">
          {/* Goal Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
            <input
              type="text"
              {...register('goalName', { 
                required: 'Goal name is required',
                minLength: { value: 3, message: 'Goal name must be at least 3 characters' },
                maxLength: { value: 50, message: 'Goal name cannot exceed 50 characters' },
                pattern: {
                  value: /^[a-zA-Z0-9\s\-_,.!?()]+$/,
                  message: 'Goal name contains invalid characters'
                }
              })}
              className={`w-full border ${errors.goalName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg p-3 transition-all duration-200 focus:border-blue-500 hover:border-blue-300`}
              placeholder="e.g. Emergency Fund"
            />
            {errors.goalName && <p className="mt-1 text-sm text-red-600">{errors.goalName.message}</p>}
          </div>
          
          {/* Progress Preview */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span className="font-medium">Goal Progress</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${progress >= 100 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                className={`h-3 rounded-full ${getProgressColor(progress)} transition-all duration-500 ease-in-out`} 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Current</p>
                <p className="text-lg font-semibold text-blue-600">{formatCurrency(currentAmount)}</p>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm">
                <p className="text-xs text-gray-500 mb-1">Target</p>
                <p className="text-lg font-semibold text-green-600">{formatCurrency(targetAmount)}</p>
              </div>
            </div>
            
            {remainingAmount > 0 && (
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-500">Still needed:</p>
                <p className="text-sm font-semibold text-indigo-600">{formatCurrency(remainingAmount)}</p>
              </div>
            )}
            {currentAmount >= targetAmount && (
              <div className="mt-2 flex justify-center items-center text-sm text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Goal achieved! 🎉
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                    max: { value: 1000000000, message: 'Target amount is too large' },
                    validate: {
                      notTooManyDecimals: value => {
                        const decimals = value.toString().split('.')[1];
                        return !decimals || decimals.length <= 2 || 'Maximum 2 decimal places allowed';
                      }
                    },
                    valueAsNumber: true
                  })}
                  className={`block w-full rounded-md pl-7 pr-3 py-3 ${errors.targetAmount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} transition-all duration-200 focus:border-blue-500 hover:border-blue-300`}
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
                    max: { value: 1000000000, message: 'Current amount is too large' },
                    validate: {
                      notTooManyDecimals: value => {
                        const decimals = value.toString().split('.')[1];
                        return !decimals || decimals.length <= 2 || 'Maximum 2 decimal places allowed';
                      },
                      notGreaterThanTarget: value => {
                        // Only validate if target is valid
                        const target = Number(watch('targetAmount'));
                        if (isNaN(target) || target <= 0) return true;
                        
                        // Do nothing here - we'll auto-update status when this happens
                        return true;
                      }
                    },
                    valueAsNumber: true
                  })}
                  className={`block w-full rounded-md pl-7 pr-3 py-3 ${errors.currentAmount ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} transition-all duration-200 focus:border-blue-500 hover:border-blue-300`}
                />
              </div>
              {errors.currentAmount && <p className="mt-1 text-sm text-red-600">{errors.currentAmount.message}</p>}
              {currentAmount > targetAmount && targetAmount > 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  Current amount exceeds target - status set to achieved
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input
                type="date"
                min={minDate}
                {...register('deadline', { 
                  required: 'Deadline is required',
                  validate: {
                    futureDate: value => {
                      const selectedDate = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      
                      return selectedDate >= today || 'Deadline must be today or in the future';
                    },
                    notTooFarAway: value => {
                      const selectedDate = new Date(value);
                      const maxDate = new Date();
                      maxDate.setFullYear(maxDate.getFullYear() + 30); // Max 30 years in future
                      
                      return selectedDate <= maxDate || 'Deadline cannot be more than 30 years in the future';
                    }
                  }
                })}
                className={`w-full border ${errors.deadline ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg p-3 transition-all duration-200 focus:border-blue-500 hover:border-blue-300`}
              />
              {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline.message}</p>}
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                {...register('status', { 
                  required: 'Status is required',
                  validate: {
                    progressMatch: value => {
                      // If the goal is marked as achieved, ensure amount is at least the target
                      if (value === 'achieved' && currentAmount < targetAmount && targetAmount > 0) {
                        return 'Cannot mark as achieved when the current amount is less than the target';
                      }
                      
                      // If current amount meets or exceeds target, status should be achieved
                      if (value !== 'achieved' && currentAmount >= targetAmount && targetAmount > 0) {
                        // Auto-correct instead of showing an error
                        setValue('status', 'achieved');
                      }
                      
                      return true;
                    }
                  }
                })}
                className={`w-full border ${errors.status ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} rounded-lg p-3 transition-all duration-200 focus:border-blue-500 hover:border-blue-300`}
                disabled={currentAmount >= targetAmount && targetAmount > 0}
              >
                <option value="in progress">In Progress</option>
                <option value="achieved">Achieved</option>
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
              {currentAmount >= targetAmount && targetAmount > 0 && (
                <p className="mt-1 text-sm text-green-600">
                  Status automatically set to "Achieved" as you've reached your target
                </p>
              )}
            </div>
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              {...register('notes', {
                maxLength: { value: 500, message: 'Notes cannot exceed 500 characters' }
              })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-blue-300"
              placeholder="Add any notes or details about your financial goal..."
            ></textarea>
            {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
            {watch('notes') && (
              <p className="mt-1 text-xs text-gray-500 text-right">
                {watch('notes').length}/500 characters
              </p>
            )}
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              className="px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-colors disabled:opacity-70 font-medium shadow-md hover:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : initialData?._id ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialGoalModal;