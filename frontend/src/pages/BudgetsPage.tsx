import { useState, useEffect, SetStateAction } from 'react';
import { 
  PlusCircleIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import BudgetModal from '../components/Model/BudgetsModel'; // Import BudgetModal
import { Dialog } from '@headlessui/react'; // Optional for confirmation dialog

// Sample budget data - replace with actual data fetching
const initialBudgets = [
  { id: 1, name: 'Groceries', allocated: 500, spent: 320, category: 'Essentials' },
  { id: 2, name: 'Entertainment', allocated: 200, spent: 150, category: 'Lifestyle' },
  { id: 3, name: 'Transportation', allocated: 300, spent: 280, category: 'Essentials' },
  { id: 4, name: 'Dining Out', allocated: 250, spent: 300, category: 'Lifestyle' },
];

const Budgets = () => {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [newBudget, setNewBudget] = useState({ name: '', allocated: '', category: 'Essentials' });
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<{ id: number; name: string; allocated: number; spent: number; category: string } | null>(null);
  
  useEffect(() => {
    // Calculate totals and ensure they are numbers
    const allocated = budgets.reduce((sum, budget) => sum + (Number(budget.allocated) || 0), 0);
    const spent = budgets.reduce((sum, budget) => sum + (Number(budget.spent) || 0), 0);
    setTotalAllocated(allocated);
    setTotalSpent(spent);
  }, [budgets]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBudget((prev) => ({ ...prev, [name]: name === 'allocated' ? parseFloat(value) || '' : value }));
  };
  
  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.name || !newBudget.allocated) return;
    
    const newBudgetItem = {
      id: Date.now(),
      name: newBudget.name,
      allocated: parseFloat(String(newBudget.allocated)) || 0, // Ensure allocated is a number
      spent: 0, // Default spent to 0
      category: newBudget.category
    };
    
    setBudgets((prev) => [...prev, newBudgetItem]);
    setNewBudget({ name: '', allocated: '', category: 'Essentials' });
  };

  const handleEdit = (budget: { id: number; name: string; allocated: number; spent: number; category: string }) => {
      setSelectedBudget(budget);
      setIsEditModalOpen(true);
  };
  
  const handleDelete = (budget: { id: number; name: string; allocated: number; spent: number; category: string }) => {
      setSelectedBudget(budget);
      setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedBudget) {
      setBudgets((prev) => prev.filter((b) => b.id !== selectedBudget.id));
    }
    setIsDeleteDialogOpen(false);
    setSelectedBudget(null);
  };

  const saveEditedBudget = (updatedBudget: { id: number; name: string; allocated: number; spent: number; category: string }) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === updatedBudget.id ? updatedBudget : b))
    );
    setIsEditModalOpen(false);
    setSelectedBudget(null);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Budget Management</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold text-gray-800">${Number(totalAllocated).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-800">${Number(totalSpent).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3 mr-4">
              <ExclamationCircleIcon className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-gray-800">${(Number(totalAllocated) - Number(totalSpent)).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create New Budget - Modernized */}
      <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <PlusCircleIcon className="h-6 w-6 mr-2" />
            Create New Budget
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleAddBudget} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Budget Name</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newBudget.name}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-blue-300"
                    placeholder="e.g., Groceries"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="allocated" className="block text-sm font-medium text-gray-700">Amount ($)</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="allocated"
                    name="allocated"
                    value={newBudget.allocated}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-blue-300"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <select
                    id="category"
                    name="category"
                    value={newBudget.category}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 pl-3 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-blue-300"
                  >
                    <option value="Essentials">Essentials</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Savings">Savings</option>
                    <option value="Housing">Housing</option>
                    <option value="Transportation">Transportation</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                className="flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Add Budget
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Budget List */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Budgets</h2>
        </div>
        <div className="overflow-hidden">
          <div className="p-6">
            {budgets.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No budgets created yet. Add your first budget above.</p>
            ) : (
              <div className="space-y-6">
                {budgets.map((budget) => {
                  // Ensure `spent` is a number
                  const spent = typeof budget.spent === 'number' ? budget.spent : 0;
                  const allocated = typeof budget.allocated === 'number' ? budget.allocated : 0;

                  const percentage = allocated > 0 ? (spent / allocated) * 100 : 0; // Avoid division by zero
                  let progressColor = "bg-blue-500"; // Default color

                  if (percentage >= 90) {
                    progressColor = "bg-red-500"; // Overspent
                  } else if (percentage >= 70) {
                    progressColor = "bg-yellow-500"; // Caution
                  }

                  return (
                    <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between mb-1">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">{budget.name}</h3>
                          <span className="text-xs inline-block bg-gray-100 rounded px-2 py-1 text-gray-700">
                            {budget.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            ${spent.toFixed(2)} of ${allocated.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {percentage.toFixed(1)}% used
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div
                          className={`${progressColor} h-2.5 rounded-full`}
                          style={{ width: `${Math.min(100, percentage)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          className="text-blue-500 hover:text-blue-700"
                          onClick={() => handleEdit(budget)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(budget)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <BudgetModal
          onClose={() => setIsEditModalOpen(false)}
          onSave={(data) => {
            const updatedBudget = {
              id: selectedBudget?.id || 0,
              name: data.budgetName || '',
              allocated: data.totalAmount,
              spent: data.spent,
              category: data.category,
            };
            saveEditedBudget(updatedBudget);
          }}
          id={selectedBudget?.id}
          name={selectedBudget?.name}
          allocated={selectedBudget?.allocated}
          spent={selectedBudget?.spent}
          category={selectedBudget?.category}
          totalAmount={selectedBudget?.allocated || 0}
          currentAmount={selectedBudget?.spent || 0}
          deadline={new Date().toISOString()} // Replace with actual deadline if available
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete the budget "{selectedBudget?.name}"?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Budgets;