import { useState } from "react";
import TransactionModal from "../Model/TransactionModal";
import { saveTransaction } from "../../services/transactionService";
import Button from "../Button";
import { useAuth } from "../../hook/useAuth";
const AddTransactionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  const handleSave = async (data: { type: string; category: string; amount: number; date: string; description: string }) => {
    
    try {
      
      if (user) {
        await saveTransaction(user, data);
        alert("Transaction saved successfully!");
      } else {
        alert("User is not authenticated.");
      }
      alert("Transaction saved successfully!");
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction.");
    }
  };

  return (
    <div>
      <Button
        text="Add Transaction"
        onClick={() => setIsOpen(true)}
        variant="primary"
      />

      {isOpen && (
        <TransactionModal
          onClose={() => setIsOpen(false)}
          onSave={handleSave}
          type=""
          category=""
          amount={0}
          date=""
          description=""
        />
      )}
    </div>
  );
};

export default AddTransactionButton;
