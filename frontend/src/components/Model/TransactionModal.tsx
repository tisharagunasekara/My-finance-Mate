import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { getBudgets, updateBudget } from "../../services/budgetService";
import { useAuth } from '../../hook/useAuth';
import { toast } from 'react-toastify';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

// Proper typing for component props
interface TransactionModalProps {
  onClose: () => void;
  onSave: (data: TransactionFormData) => void;
}

// Form data interface
interface TransactionFormData {
  type: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  notes?: string;
}

// Budget interface
interface Budget {
  _id: string;
  name: string;
  amount: number;
  spent: number;
  percentageUsed: number;
  category: string;
  title?: string;
}

const TransactionModal = ({ onClose, onSave }: TransactionModalProps) => {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    watch,
   
  } = useForm<TransactionFormData>({
    mode: "onChange",
    defaultValues: {
      type: "",
      category: "",
      amount: undefined,
      date: new Date().toISOString().split('T')[0], // Default to today
      description: "",
      notes: ""
    }
  });
  
  const selectedType = watch("type");
  const [categories, setCategories] = useState<string[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{message: string; type: 'success' | 'error' | 'info' | null}>({
    message: "",
    type: null
  });

  // Update categories based on selected transaction type
  useEffect(() => {
    if (selectedType === "income") {
      // Use predefined income categories
      setCategories([
        "Salary",
        "Freelance",
        "Investments",
        "Dividends",
        "Rental Income",
        "Gifts",
        "Refunds",
        "Other Income"
      ]);
      setFeedback({
        message: "Income categories loaded",
        type: "info"
      });
    } else if (selectedType === "expense") {
      // Fetch budget categories from API for expenses
      const fetchBudgets = async () => {
        setIsLoading(true);
        try {
          if (!user) {
            setFeedback({
              message: "You must be logged in to access budget categories",
              type: "error"
            });
            return;
          }
          
          const data = await getBudgets(user);
          if (data && Array.isArray(data)) {
            setBudgets(data); // Store full budget objects
            const categoryNames = data.map((budget: any) => budget.name || budget.title);
            setCategories(categoryNames);
            
            if (categoryNames.length === 0) {
              setFeedback({
                message: "No budget categories found. Consider creating budgets first.",
                type: "info"
              });
            } else {
              setFeedback({
                message: `${categoryNames.length} budget categories loaded`,
                type: "success"
              });
            }
          } else {
            setFeedback({
              message: "Invalid budget data format received",
              type: "error"
            });
            setCategories([]);
            setBudgets([]);
          }
        } catch (err) {
          console.error("Error fetching budgets:", err);
          setFeedback({
            message: "Failed to load budget categories. Please try again.",
            type: "error"
          });
          setCategories([]);
          setBudgets([]);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchBudgets();
    } else {
      setCategories([]);
      setBudgets([]);
      setFeedback({
        message: "",
        type: null
      });
    }
  }, [selectedType, user]);

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsLoading(true);
      
      // If this is an expense, update the corresponding budget
      if (data.type === "expense" && user) {
        // Find the budget with the matching category name
        const matchingBudget = budgets.find(budget => 
          (budget.name === data.category) || (budget.title === data.category)
        );
        
        if (matchingBudget) {
          // Calculate new spent amount
          const newSpentAmount = Number(matchingBudget.spent) + Number(data.amount);
          const newPercentageUsed = (newSpentAmount / Number(matchingBudget.amount)) * 100;
          
          // Update budget with new spent amount
          const updatedBudgetData = {
            ...matchingBudget,
            spent: newSpentAmount,
            percentageUsed: newPercentageUsed
          };
          
          // Call API to update budget
          await updateBudget(user, matchingBudget._id, updatedBudgetData);
          toast.success(`Updated budget "${matchingBudget.name}" with expense of $${data.amount}`);
        } else {
          // This should rarely happen as categories are loaded from budgets
          toast.warning("No matching budget found for this expense category");
        }
      }
      
      // Continue with existing transaction save logic
      onSave(data); 
      reset();
      toast.success("Transaction saved successfully!");
      onClose();
    } catch (error) {
      console.error("Error processing transaction:", error);
      setFeedback({
        message: "Failed to save transaction. Please try again.",
        type: "error"
      });
      toast.error("Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Add Transaction</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {feedback.type && (
            <div className={`mb-4 rounded-lg p-3 flex items-center ${
              feedback.type === 'success' ? 'bg-green-100 text-green-800' : 
              feedback.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {feedback.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mr-2" /> :
               feedback.type === 'error' ? <ExclamationCircleIcon className="h-5 w-5 mr-2" /> :
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
              }
              <span className="text-sm">{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Type */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Transaction Type</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-all
                  ${selectedType === "income" ? 
                    "border-green-500 bg-green-50 text-green-700" : 
                    "border-gray-300 hover:border-gray-400"}`}>
                  <input
                    type="radio"
                    {...register("type", { required: "Please select a transaction type" })}
                    value="income"
                    className="sr-only"
                  />
                  <ArrowUpIcon className={`h-5 w-5 mr-2 ${selectedType === "income" ? "text-green-500" : "text-gray-400"}`} />
                  <span>Income</span>
                </label>
                <label className={`flex items-center justify-center border rounded-lg p-3 cursor-pointer transition-all
                  ${selectedType === "expense" ? 
                    "border-red-500 bg-red-50 text-red-700" : 
                    "border-gray-300 hover:border-gray-400"}`}>
                  <input
                    type="radio"
                    {...register("type", { required: "Please select a transaction type" })}
                    value="expense"
                    className="sr-only"
                  />
                  <ArrowDownIcon className={`h-5 w-5 mr-2 ${selectedType === "expense" ? "text-red-500" : "text-gray-400"}`} />
                  <span>Expense</span>
                </label>
              </div>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
            </div>

            {/* Category as dropdown */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <div className="relative">
                <select 
                  {...register("category", { required: "Please select a category" })}
                  className={`block w-full rounded-lg border ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  } px-4 py-3 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500`}
                  disabled={!selectedType || isLoading}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {isLoading && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
              </div>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              {!selectedType && <p className="mt-1 text-sm text-amber-600">Please select a transaction type first</p>}
            </div>

            {/* Amount */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input 
                  type="number" 
                  step="0.01"
                  {...register("amount", { 
                    required: "Amount is required",
                    min: { value: 0.01, message: "Amount must be at least 0.01" },
                    valueAsNumber: true,
                    validate: (value) => !isNaN(value) || "Please enter a valid number"
                  })}
                  className={`block w-full rounded-lg border ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  } pl-8 pr-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
            </div>

            {/* Date */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
              <input 
                type="date" 
                {...register("date", { required: "Date is required" })}
                className={`block w-full rounded-lg border ${
                  errors.date ? "border-red-500" : "border-gray-300"
                } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <input 
                type="text" 
                {...register("description", { 
                  required: "Description is required",
                  minLength: { value: 3, message: "Description must be at least 3 characters" }
                })}
                className={`block w-full rounded-lg border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } px-4 py-3 focus:border-blue-500 focus:ring-blue-500`}
                placeholder="Brief description of transaction"
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
              <textarea 
                {...register("notes")} 
                className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Additional details about this transaction"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose}
                className="px-5 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                    Processing...
                  </>
                ) : "Save Transaction"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;
