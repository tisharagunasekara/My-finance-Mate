import { useEffect, useState, useMemo } from "react";
import { getTransactionsByUserId, deleteTransactionById } from "../services/transactionService";
import AddTransactionButton from "../components/Button/AddTransactionButton";
import ReusableTable from "../components/Table";
import { useAuth } from "../hook/useAuth";
import EditTransactionForm from "../components/Model/EditTransactionForm";
import { toast } from "react-toastify";
import GenerateReportButton from "../components/Button/GenerateReportButton";

interface Transaction {
  _id: string;
  userId: string;
  type: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  description?: string;
}

interface DeleteConfirmation {
  isOpen: boolean;
  transactionId: string | null;
}

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    transactionId: null
  });

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    
    const query = searchQuery.toLowerCase().trim();
    return transactions.filter(transaction => 
      transaction.type.toLowerCase().includes(query) ||
      transaction.category.toLowerCase().includes(query) ||
      (transaction.description || '').toLowerCase().includes(query) ||
      (transaction.notes || '').toLowerCase().includes(query) ||
      transaction.amount.toString().includes(query) ||
      new Date(transaction.date).toLocaleDateString().includes(query)
    );
  }, [transactions, searchQuery]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Define table columns with formatting
  const tableColumns = useMemo(() => [
    { 
      key: "type", 
      label: "Type", 
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === "income" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {value === "income" ? (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
            </svg>
          )}
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { 
      key: "category", 
      label: "Category", 
      sortable: true,
      render: (value: string) => (
        <span className="capitalize">{value}</span>
      )
    },
    { 
      key: "date", 
      label: "Date", 
      sortable: true,
      render: (value: string) => formatDate(value)
    },
    { 
      key: "amount", 
      label: "Amount", 
      sortable: true,
      render: (value: number, row: Transaction) => (
        <span className={row.type === "income" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
          {formatCurrency(value)}
        </span>
      )
    },
    { 
      key: "description", 
      label: "Description", 
      render: (value: string) => value || '—'
    },
    {
      key: "notes",
      label: "Notes",
      render: (value: string) => value || '—'
    }
  ], []);

  // Fetch all transactions for the user
  const fetchTransactionsByUserId = async (userId: string) => {
    setLoading(true);
    try {
      const data = await getTransactionsByUserId(userId);
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions");
      toast.error("Could not load your transactions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to show delete confirmation
  const confirmDelete = (transactionId: string) => {
    setDeleteConfirmation({
      isOpen: true,
      transactionId
    });
  };

  // Function to cancel delete
  const cancelDelete = () => {
    setDeleteConfirmation({
      isOpen: false,
      transactionId: null
    });
  };

  // Function to delete a transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransactionById(transactionId);
      setTransactions(transactions.filter(transaction => transaction._id !== transactionId));
      toast.success("Transaction deleted successfully");
      setDeleteConfirmation({ isOpen: false, transactionId: null });
    } catch {
      setError("Failed to delete transaction");
      toast.error("Could not delete the transaction. Please try again.");
    }
  };

  // Function to handle edit button click
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  // Function to handle save after editing
  const handleSaveEdit = () => {
    setEditingTransaction(null);
    if (user) {
      fetchTransactionsByUserId(user); // Refresh transactions after edit
      toast.success("Transaction updated successfully");
    }
  };

  // Function to handle transaction refresh
  const handleTransactionRefresh = () => {
    if (user) {
      fetchTransactionsByUserId(user); // Refresh transactions after add
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  // Function to handle generating report
  const handleGenerateReport = () => {
    if (transactions.length === 0) {
      toast.warn("No transactions available to generate a report");
      return;
    }
  };

  // Function to handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    if (user) {
      fetchTransactionsByUserId(user);
    }
  }, [user]);

  return (
    <div className="px-6 py-8 md:px-8 max-w-7xl mx-auto">
      <div className="mb-10 relative">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Transaction Management</h1>
          <p className="text-gray-500 text-lg">Track, manage your Income & Expense</p>
        </div>
        
        {/* Search bar positioned in the top-right corner */}
        <div className="absolute top-0 right-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search transactions..."
              className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold mb-4 md:mb-0">Your Transactions</h2>
          <div className="flex space-x-3">
            <GenerateReportButton transactions={transactions} />
            <AddTransactionButton onTransactionAdded={handleTransactionRefresh} />
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {searchQuery && filteredTransactions.length === 0 && !loading ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No matching transactions</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <ReusableTable
            columns={tableColumns}
            data={filteredTransactions}
            isLoading={loading}
            actions={(row) => (
              <div className="flex space-x-2">
                <button
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                  onClick={() => handleEditTransaction(row)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  className="text-red-600 hover:text-red-800 font-medium text-sm flex items-center"
                  onClick={() => confirmDelete(row._id)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            )}
          />
        )}
        
        {/* Delete Confirmation Modal */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Confirm Deletion</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteConfirmation.transactionId && handleDeleteTransaction(deleteConfirmation.transactionId)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {editingTransaction && (
          <EditTransactionForm
            transaction={editingTransaction}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
          />
        )}
      </div>
    </div>
  );
};

export default Transactions;
