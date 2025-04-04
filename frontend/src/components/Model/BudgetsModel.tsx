import { useForm } from "react-hook-form";

interface BudgetForm {
  budgetName?: string;
  totalAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  notes?: string;
  spent: number;
  onClose: () => void;
  onSave: (data: BudgetForm) => void;
  _id?: string;
}

const BudgetModal = ({ onClose, onSave, ...initialData }: BudgetForm) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BudgetForm>({
    defaultValues: {
      budgetName: initialData.budgetName || "",
      category: initialData.category || "",
      totalAmount: initialData.totalAmount || 0,
      currentAmount: initialData.currentAmount || 0,
      deadline: initialData.deadline ? initialData.deadline.substring(0, 10) : new Date().toISOString().substring(0, 10),
      spent: initialData.spent || 0,
      notes: initialData.notes || "",
    },
  });

  const onSubmit = (data: BudgetForm) => {
    onSave({ ...initialData, ...data });
    reset(); 
    onClose(); 
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {initialData?.budgetName ? "Edit Budget" : "Add Budget"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Budget Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Budget Name</label>
            <input
              type="text"
              {...register("budgetName", { required: "Budget name is required" })}
              className="mt-1 p-2 w-full border rounded-lg"
            />
            {errors.budgetName && <p className="text-red-500 text-sm">{errors.budgetName.message}</p>}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              {...register("category", { required: "Category is required" })}
              className="mt-1 p-2 w-full border rounded-lg"
            >
              <option value="">Select a category</option>
              <option value="Essentials">Essentials</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Savings">Savings</option>
              <option value="Housing">Housing</option>
              <option value="Transportation">Transportation</option>
            </select>
            {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
          </div>

          {/* Total Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
            <input
              type="number"
              step="0.01"
              {...register("totalAmount", { 
                required: "Total amount is required", 
                min: { value: 0.01, message: "Amount must be positive" } 
              })}
              className="mt-1 p-2 w-full border rounded-lg"
            />
            {errors.totalAmount && <p className="text-red-500 text-sm">{errors.totalAmount.message}</p>}
          </div>

          {/* Spent Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Spent Amount</label>
            <input
              type="number"
              step="0.01"
              {...register("spent", { 
                required: "Spent amount is required", 
                min: { value: 0, message: "Spent amount cannot be negative" } 
              })}
              className="mt-1 p-2 w-full border rounded-lg"
            />
            {errors.spent && <p className="text-red-500 text-sm">{errors.spent.message}</p>}
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

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea {...register("notes")} className="mt-1 p-2 w-full border rounded-lg" />
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

export default BudgetModal;
