import { useForm } from "react-hook-form";

interface TransactionForm {
  type: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  notes?: string;
  onClose: () => void; // Function to close modal
  onSave: (data: TransactionForm) => void; // Function to save transaction
}

const TransactionModal = ({ onClose, onSave }: TransactionForm) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransactionForm>();

  const onSubmit = (data: TransactionForm) => {
    onSave(data); // Call parent function to save data
    reset();
    onClose(); // Close modal after saving
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select {...register("type", { required: "Transaction type is required" })}
              className="mt-1 p-2 w-full border rounded-lg">
              <option value="">Select</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input type="text" {...register("category", { required: "Category is required" })}
              className="mt-1 p-2 w-full border rounded-lg"/>
            {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Amount</label>
            <input type="number" {...register("amount", { required: "Amount is required", min: 1 })}
              className="mt-1 p-2 w-full border rounded-lg"/>
            {errors.amount && <p className="text-red-500 text-sm">{errors.amount.message}</p>}
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" {...register("date", { required: "Date is required" })}
              className="mt-1 p-2 w-full border rounded-lg"/>
            {errors.date && <p className="text-red-500 text-sm">{errors.date.message}</p>}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" {...register("description", { required: "Description is required" })}
              className="mt-1 p-2 w-full border rounded-lg"/>
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea {...register("notes")} className="mt-1 p-2 w-full border rounded-lg"/>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
