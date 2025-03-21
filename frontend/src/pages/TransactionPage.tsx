import { useEffect, useState } from "react";
import { getTransactionsByUserId, deleteTransactionById } from "../services/transactionService"; // Import the delete service
import AddTransactionButton from "../components/Button/AddTransactionButton";
import ReusableTable from "../components/Table";
import { columns } from "../dummuData/sampleData";
import { useAuth } from "../hook/useAuth";

interface Transaction {
  _id: string;
  userId: string;
  type: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
}

const Transactions = () => {
  const { user } = useAuth(); // Get the current authenticated user
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all transactions for the user
  const fetchTransactionsByUserId = async (userId: string) => {
    setLoading(true);
    try {
      const data = await getTransactionsByUserId(userId); // Fetch transactions for the user
      setTransactions(data); // Set the transactions state
    } catch {
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a transaction
  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      const confirmation = window.confirm("Are you sure you want to delete this transaction?");
      if (confirmation) {
        await deleteTransactionById(transactionId); // Delete transaction from the backend
        // Update the state by filtering out the deleted transaction
        setTransactions(transactions.filter(transaction => transaction._id !== transactionId));
      }
    } catch {
      setError("Failed to delete transaction");
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactionsByUserId(user); // Fetch transactions when the user is available
    }
  }, [user]); // Add 'user' as a dependency to fetch data when user changes

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <AddTransactionButton />

      {loading && <p>Loading transactions...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        <ReusableTable
          columns={columns}
          data={transactions}
          actions={(row) => (
            <div className="flex gap-2">
              <button
                className="text-blue-500"
                onClick={() => alert(`Editing ${row.category}`)}
              >
                Edit
              </button>
              <button
                className="text-red-500"
                onClick={() => handleDeleteTransaction(row._id)} // Call delete handler
              >
                Delete
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default Transactions;
