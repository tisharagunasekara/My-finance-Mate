import { useState } from "react";
import FinancialGoalModal from "../Model/FinaceGoalModel";
import Button from "../Button";

const AddFinancialGoalButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = async (data: {
    goalName: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    status: string;
    notes?: string;
  }) => {
    try {
      // Implement your save logic here (e.g., save financial goal to a database)
      console.log("Financial Goal saved:", data);
      alert("Financial goal saved successfully!");
    } catch (error) {
      console.error("Error saving financial goal:", error);
      alert("Failed to save financial goal.");
    }
  };

  return (
    <div>
      <Button
        text="Add Financial Goal"
        onClick={() => setIsOpen(true)}
        variant="primary"
      />

      {isOpen && (
        <FinancialGoalModal
          onClose={() => setIsOpen(false)}
          onSave={handleSave}
          initialData={{
            goalName: "",
            targetAmount: 0,
            currentAmount: 0,
            deadline: new Date().toISOString().split('T')[0],
            status: "in progress",
            notes: ""
          }}
        />
      )}
    </div>
  );
};

export default AddFinancialGoalButton;
