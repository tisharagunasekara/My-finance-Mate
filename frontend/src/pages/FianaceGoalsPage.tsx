import AddFinancialGoalButton from "../components/Button/AddFinaceGoalsButton";
import ReusableTable from "../components/Table";
import { transactions,columns } from "../dummuData/sampleData";
const Goals = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Financial Goal</h1>
      <AddFinancialGoalButton />
      <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">All Financial Goals</h1>
      <ReusableTable
        columns={columns}
        data={transactions}
        actions={(row) => (
          <div className="flex gap-2">
            <button className="text-blue-500" onClick={() => alert(`Editing ${row.category}`)}>
              Edit
            </button>
            <button className="text-red-500" onClick={() => alert(`Deleting ${row.category}`)}>
              Delete
            </button>
          </div>
        )}
      />
    </div>
    </div>
  );
};

export default Goals;