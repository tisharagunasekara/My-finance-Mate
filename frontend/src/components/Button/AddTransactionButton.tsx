import { useState } from 'react';
import TransactionModal from '../Model/TransactionModal';
import { saveTransaction } from '../../services/transactionService';
import { useAuth } from '../../hook/useAuth';
import { toast } from 'react-toastify';

// Define the transaction form data interface to match what's in TransactionModal
interface TransactionFormData {
  type: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  notes?: string;
}

interface AddTransactionButtonProps {
  onTransactionAdded?: () => void;
}

const AddTransactionButton = ({ onTransactionAdded }: AddTransactionButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveTransaction = async (data: TransactionFormData) => {
    try {
      if (!user) {
        toast.error("You must be logged in to add a transaction");
        return;
      }
      
      const transactionData = {
        ...data,
        userId: user,
      };
      
      await saveTransaction(user, transactionData);
      toast.success("Transaction added successfully!");
      handleCloseModal(); // Close the modal after successful save
      
      // Call the callback to refresh transactions
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    }
  };

  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={handleOpenModal}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Add Transaction
      </button>
      {isModalOpen && (
        <TransactionModal
          onClose={handleCloseModal}
          onSave={handleSaveTransaction}
        />
      )}
    </div>
  );
};

export default AddTransactionButton;
