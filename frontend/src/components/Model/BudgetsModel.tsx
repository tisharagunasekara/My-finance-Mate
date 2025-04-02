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
}

const BudgetModal = ({ onClose, onSave, ...initialData }: BudgetForm) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BudgetForm>({
    defaultValues: {
      category: initialData.category || "",
      totalAmount: initialData.totalAmount || 0,
      currentAmount: initialData.currentAmount || 0,
      deadline: initialData.deadline || "",
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">
          {initialData?.budgetName ? "Edit Budget" : "Add Budget"}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              {...register("category", { required: "Category is required" })}
              className="mt-1 p-2 w-full border rounded-lg"
            />
            {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
          </div>

          {/* Total Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Total Amount</label>
            <input
              type="number"
              {...register("totalAmount", { required: "Total amount is required", min: 1 })}
              className="mt-1 p-2 w-full border rounded-lg"
            />
            {errors.totalAmount && <p className="text-red-500 text-sm">{errors.totalAmount.message}</p>}
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

          {/* Spent Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Spent Amount</label>
            <input
              type="number"
              {...register("spent", { required: "Spent amount is required", min: 0 })}
              className="mt-1 p-2 w-full border rounded-lg"
            />
            {errors.spent && <p className="text-red-500 text-sm">{errors.spent.message}</p>}
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
