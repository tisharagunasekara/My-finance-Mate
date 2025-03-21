export const data = [
    { name: "Category A", value: 400 },
    { name: "Category B", value: 300 },
    { name: "Category C", value: 300 },
    { name: "Category D", value: 200 },
  ];
export const data1 =[
    { name: "Icome ", value: 400 },
    { name: "Expense", value: 300 }, 
  ];


export const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];


export const transactions = [
  { id: 1, type: "Income", category: "Salary", amount: 5000, date: "2024-03-21" },
  { id: 2, type: "Expense", category: "Groceries", amount: 200, date: "2024-03-19" },
  { id: 3, type: "Income", category: "Freelance", amount: 1200, date: "2024-03-18" },
];

export const columns = [
  { key: "type", label: "Type", sortable: true },
  { key: "category", label: "Category", sortable: true },
  { key: "amount", label: "Amount", sortable: true },
  { key: "date", label: "Date", sortable: true },
];


export const budgets = [
  { id: 1, userId: "649c75e1f7f8d8b3a9e7d14c", category: "Groceries", limit: 500, startDate: "2025-03-01", endDate: "2025-03-31" },
  { id: 2, userId: "649c75e1f7f8d8b3a9e7d14c", category: "Entertainment", limit: 200, startDate: "2025-03-01", endDate: "2025-03-31" },
  { id: 3, userId: "649c75e1f7f8d8b3a9e7d15d", category: "Transportation", limit: 150, startDate: "2025-03-01", endDate: "2025-03-31" },
  { id: 4, userId: "649c75e1f7f8d8b3a9e7d16f", category: "Dining Out", limit: 300, startDate: "2025-03-01", endDate: "2025-03-31" },
  { id: 5, userId: "649c75e1f7f8d8b3a9e7d16f", category: "Shopping", limit: 600, startDate: "2025-03-01", endDate: "2025-03-31" },
  { id: 6, userId: "649c75e1f7f8d8b3a9e7d17e", category: "Healthcare", limit: 400, startDate: "2025-03-01", endDate: "2025-03-31" },
  { id: 7, userId: "649c75e1f7f8d8b3a9e7d17e", category: "Utilities", limit: 200, startDate: "2025-03-01", endDate: "2025-03-31" },
  { id: 8, userId: "649c75e1f7f8d8b3a9e7d18d", category: "Subscriptions", limit: 150, startDate: "2025-03-01", endDate: "2025-03-31" },
  { id: 9, userId: "649c75e1f7f8d8b3a9e7d18d", category: "Education", limit: 500, startDate: "2025-03-01", endDate: "2025-03-31" },
  { id: 10, userId: "649c75e1f7f8d8b3a9e7d19b", category: "Miscellaneous", limit: 100, startDate: "2025-03-01", endDate: "2025-03-31" }
];


export const financialGoals = [
  { id: 1, userId: "649c75e1f7f8d8b3a9e7d14c", goalName: "Emergency Fund", targetAmount: 3000, currentAmount: 1200, deadline: "2025-12-31", status: "in progress" },
  { id: 2, userId: "649c75e1f7f8d8b3a9e7d14c", goalName: "Vacation Fund", targetAmount: 2500, currentAmount: 500, deadline: "2025-06-30", status: "in progress" },
  { id: 3, userId: "649c75e1f7f8d8b3a9e7d14c", goalName: "New Car Fund", targetAmount: 15000, currentAmount: 2000, deadline: "2025-11-30", status: "in progress" },
  { id: 4, userId: "649c75e1f7f8d8b3a9e7d15d", goalName: "Home Renovation", targetAmount: 10000, currentAmount: 4500, deadline: "2025-11-01", status: "in progress" },
  { id: 5, userId: "649c75e1f7f8d8b3a9e7d15d", goalName: "Wedding Fund", targetAmount: 20000, currentAmount: 8000, deadline: "2025-09-15", status: "in progress" },
  { id: 6, userId: "649c75e1f7f8d8b3a9e7d16f", goalName: "Debt Repayment", targetAmount: 5000, currentAmount: 3000, deadline: "2025-06-30", status: "in progress" },
  { id: 7, userId: "649c75e1f7f8d8b3a9e7d16f", goalName: "College Fund", targetAmount: 12000, currentAmount: 2000, deadline: "2025-12-31", status: "in progress" },
  { id: 8, userId: "649c75e1f7f8d8b3a9e7d17e", goalName: "Emergency Fund", targetAmount: 2500, currentAmount: 1000, deadline: "2025-07-15", status: "in progress" },
  { id: 9, userId: "649c75e1f7f8d8b3a9e7d18d", goalName: "Vacation Fund", targetAmount: 4000, currentAmount: 1500, deadline: "2025-08-01", status: "in progress" },
  { id: 10, userId: "649c75e1f7f8d8b3a9e7d18d", goalName: "Emergency Fund", targetAmount: 5000, currentAmount: 2000, deadline: "2025-10-30", status: "in progress" }
];
