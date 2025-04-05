import { useState, useEffect } from 'react';
import { 
  PlusCircleIcon, 
  CurrencyDollarIcon, 
  ChartBarIcon, 
  ExclamationCircleIcon,
  HomeIcon,
  ShoppingCartIcon,
  BanknotesIcon,
  TruckIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import BudgetModal from '../components/Model/BudgetsModel';
import { Dialog } from '@headlessui/react';
import { useAuth } from '../hook/useAuth';
import { 
  createBudget, 
  getBudgets, 
  updateBudget, 
  deleteBudget 
} from '../services/budgetService';
import { toast } from 'react-toastify';

// Define interface for budget data
interface Budget {
  _id: string;
  name: string;
  amount: number;
  spent: number;
  percentageUsed: number;
  category: string;
  title?: string;
}

// Category icon mapping
const categoryIcons: Record<string, JSX.Element> = {
  Essentials: <ShoppingCartIcon className="h-5 w-5" />,
  Lifestyle: <HeartIcon className="h-5 w-5" />,
  Savings: <BanknotesIcon className="h-5 w-5" />,
  Housing: <HomeIcon className="h-5 w-5" />,
  Transportation: <TruckIcon className="h-5 w-5" />
};

// Category gradient mapping
const categoryGradients: Record<string, string> = {
  Essentials: 'from-blue-500 to-cyan-400',
  Lifestyle: 'from-purple-500 to-pink-400',
  Savings: 'from-green-500 to-emerald-400',
  Housing: 'from-amber-500 to-yellow-400',
  Transportation: 'from-rose-500 to-orange-400'
};

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [newBudget, setNewBudget] = useState({ name: '', allocated: '', category: 'Essentials' });
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch budgets from API
  useEffect(() => {
    const fetchBudgets = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await getBudgets(user);
        setBudgets(data);
      } catch (err) {
        console.error("Error fetching budgets:", err);
        setError("Failed to load budgets. Please try again.");
        toast.error("Failed to load budgets");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBudgets();
  }, [user]);
  
  // Calculate totals when budgets change
  useEffect(() => {
    const allocated = budgets.reduce((sum, budget) => sum + (Number(budget.amount) || 0), 0);
    const spent = budgets.reduce((sum, budget) => sum + (Number(budget.spent) || 0), 0);
    setTotalAllocated(allocated);
    setTotalSpent(spent);
  }, [budgets]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBudget((prev) => ({ ...prev, [name]: name === 'allocated' ? parseFloat(value) || '' : value }));
  };
  
  // Create new budget
  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newBudget.name || !newBudget.allocated) return;
    
    try {
      const budgetData = {
        name: newBudget.name,
        amount: parseFloat(String(newBudget.allocated)),
        spent: 0,
        percentageUsed: 0,
        category: newBudget.category,
        date: new Date().toISOString(),
        title: newBudget.name // Using name as title as required by your backend
      };
      
      const createdBudget = await createBudget(user, budgetData);
      setBudgets((prev) => [...prev, createdBudget]);
      setNewBudget({ name: '', allocated: '', category: 'Essentials' });
      toast.success("Budget created successfully!");
    } catch (err) {
      console.error("Error creating budget:", err);
      toast.error("Failed to create budget");
    }
  };
  
  // Open edit modal
  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsEditModalOpen(true);
  };
  
  // Open delete dialog
  const handleDelete = (budget: Budget) => {
    setSelectedBudget(budget);
    setIsDeleteDialogOpen(true);
  };
  
  // Delete budget
  const confirmDelete = async () => {
    if (!user || !selectedBudget) return;
    
    try {
      await deleteBudget(user, selectedBudget._id);
      setBudgets((prev) => prev.filter((b) => b._id !== selectedBudget._id));
      toast.success("Budget deleted successfully!");
    } catch (err) {
      console.error("Error deleting budget:", err);
      toast.error("Failed to delete budget");
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedBudget(null);
    }
  };
  
  // Update budget
  const saveEditedBudget = async (formData: any) => {
    if (!user || !selectedBudget) return;
    
    try {
      const updatedBudgetData = {
        name: formData.budgetName || selectedBudget.name,
        amount: formData.totalAmount,
        spent: formData.spent,
        percentageUsed: (formData.spent / formData.totalAmount) * 100,
        category: formData.category,
        date: new Date().toISOString(),
        title: formData.budgetName || selectedBudget.name // Using name as title
      };
      
      const updatedBudget = await updateBudget(user, selectedBudget._id, updatedBudgetData);
      
      setBudgets((prev) =>
        prev.map((b) => (b._id === selectedBudget._id ? updatedBudget : b))
      );
      toast.success("Budget updated successfully!");
    } catch (err) {
      console.error("Error updating budget:", err);
      toast.error("Failed to update budget");
    } finally {
      setIsEditModalOpen(false);
      setSelectedBudget(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-blue-500 font-medium">Loading budgets...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Budget Management</h1>
        <p className="text-gray-500 text-lg">Track, manage and control your spending</p>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-md shadow-sm mb-6 animate-pulse">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg p-6 border border-blue-200 transform transition-all hover:scale-105 duration-300">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full p-3 mr-4 shadow-md">
              <CurrencyDollarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-600">Total Budget</p>
              <p className="text-3xl font-bold text-gray-800">${Number(totalAllocated).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-6 border border-green-200 transform transition-all hover:scale-105 duration-300">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-full p-3 mr-4 shadow-md">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-600">Total Spent</p>
              <p className="text-3xl font-bold text-gray-800">${Number(totalSpent).toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg p-6 border border-yellow-200 transform transition-all hover:scale-105 duration-300">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full p-3 mr-4 shadow-md">
              <ExclamationCircleIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-600">Remaining</p>
              <p className="text-3xl font-bold text-gray-800">${(Number(totalAllocated) - Number(totalSpent)).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create New Budget */}
      <div className="bg-white rounded-2xl shadow-lg mb-10 overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <PlusCircleIcon className="h-6 w-6 mr-2" />
            Create New Budget
          </h2>
        </div>
        <div className="p-8">
          <form onSubmit={handleAddBudget} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Budget Name</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newBudget.name}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-gray-300 pl-4 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-blue-300"
                    placeholder="e.g., Groceries"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="allocated" className="block text-sm font-medium text-gray-700">Amount ($)</label>
                <div className="relative mt-1 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="allocated"
                    name="allocated"
                    value={newBudget.allocated}
                    onChange={handleInputChange}
                    className="block w-full rounded-lg border-gray-300 pl-8 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-blue-300"
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
                    className="block w-full rounded-lg border-gray-300 pl-4 pr-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 hover:border-blue-300"
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
                className="flex justify-center items-center py-3 px-8 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Add Budget
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Budget List */}
      <div className="bg-white rounded-2xl shadow-lg">
        <div className="border-b border-gray-200 px-8 py-5">
          <h2 className="text-2xl font-semibold text-gray-800">Your Budgets</h2>
        </div>
        <div className="overflow-hidden">
          <div className="p-8">
            {budgets.length === 0 ? (
              <div className="text-center py-10">
                <div className="mb-4">
                  <ExclamationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No budgets created yet.</p>
                <p className="text-gray-400 text-sm">Add your first budget using the form above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets.map((budget) => {
                  const spent = Number(budget.spent) || 0;
                  const allocated = Number(budget.amount) || 0;
                  const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;
                  let statusColor = "text-blue-500";
                  let statusText = "On Track";
                  let progressColor = "bg-blue-500";

                  if (percentage >= 90) {
                    progressColor = "bg-red-500";
                    statusColor = "text-red-500";
                    statusText = "Overspent";
                  } else if (percentage >= 70) {
                    progressColor = "bg-yellow-500";
                    statusColor = "text-yellow-500";
                    statusText = "Attention";
                  }

                  const gradientClass = categoryGradients[budget.category] || 'from-gray-500 to-gray-400';

                  return (
                    <div 
                      key={budget._id} 
                      className="border border-gray-100 rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                    >
                      <div className={`bg-gradient-to-r ${gradientClass} px-5 py-4`}>
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-white truncate">{budget.title || budget.name}</h3>
                          <div className="flex items-center bg-white bg-opacity-30 rounded-full px-3 py-1 text-xs font-medium text-white">
                            {categoryIcons[budget.category] || <ExclamationCircleIcon className="h-4 w-4 mr-1" />}
                            <span className="ml-1">{budget.category}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-gray-800">${spent.toFixed(2)}</span>
                            <span className="text-sm text-gray-500 ml-1">/ ${allocated.toFixed(2)}</span>
                          </div>
                          <span className={`text-xs font-semibold ${statusColor} px-2 py-1 rounded-full bg-opacity-10 ${statusColor.replace('text-', 'bg-')}`}>
                            {statusText}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                          <div
                            className={`${progressColor} h-3 rounded-full transition-all duration-500 ease-in-out`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-500">{percentage.toFixed(1)}% used</div>
                          <div className="flex space-x-3">
                            <button
                              className="text-blue-500 hover:text-blue-700 transition-colors flex items-center"
                              onClick={() => handleEdit(budget)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 transition-colors flex items-center"
                              onClick={() => handleDelete(budget)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
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
      {isEditModalOpen && selectedBudget && (
        <BudgetModal
          onClose={() => setIsEditModalOpen(false)}
          onSave={saveEditedBudget}
          budgetName={selectedBudget.title || selectedBudget.name}
          totalAmount={selectedBudget.amount}
          currentAmount={selectedBudget.spent}
          spent={selectedBudget.spent}
          category={selectedBudget.category}
          deadline={new Date().toISOString()}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md mx-auto transform transition-all">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Deletion</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete the budget "{selectedBudget?.title || selectedBudget?.name}"? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={confirmDelete}
              >
                Delete
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Budgets;