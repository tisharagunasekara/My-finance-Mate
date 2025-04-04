import axios from 'axios';

const API_URL = "http://localhost:5001/api";

export interface Budget {
  _id: string;
  name: string;
  amount: number;
  spent: number;
  percentageUsed: number;
  category: string;
  date: string;
  title: string;
  notes?: string;
}

export const createBudget = async (userId: string, data: Omit<Budget, '_id'>) => {
  try {
    const response = await axios.post(`${API_URL}/budgets`, {
      userId,
      category: data.category,
      amount: data.amount,
      title: data.title || data.name,
      spent: data.spent || 0,
      // percentageUsed is calculated on the server
    });
    return response.data;
  } catch (error) {
    console.error('Error creating budget:', error);
    throw new Error('Error creating budget');
  }
};

export const getBudgets = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/budgets/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    throw new Error('Error fetching budgets');
  }
};

export const getBudgetById = async (budgetId: string) => {
  try {
    const response = await axios.get(`${API_URL}/budgets/${budgetId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching budget:', error);
    throw new Error('Error fetching budget');
  }
};

export const updateBudget = async (userId: string, budgetId: string, data: Partial<Budget>) => {
  try {
    const response = await axios.put(`${API_URL}/budgets/${budgetId}`, {
      userId,
      category: data.category,
      amount: data.amount,
      title: data.title || data.name,
      spent: data.spent,
      // percentageUsed will be calculated on the server
    });
    return response.data;
  } catch (error) {
    console.error('Error updating budget:', error);
    throw new Error('Error updating budget');
  }
};

export const deleteBudget = async (userId: string, budgetId: string) => {
  try {
    await axios.delete(`${API_URL}/budgets/${budgetId}`);
    return true;
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw new Error('Error deleting budget');
  }
};

// The following methods can remain unchanged
export const getBudgetsByCategory = async (userId: string, category: string, page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URL}/budgets/${userId}/category/${category}?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching budgets by category');
  }
};

export const getBudgetsByDateRange = async (userId: string, startDate: string, endDate: string, page = 0, size = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/budgets/${userId}/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`
    );
    return response.data;
  } catch (error) {
    throw new Error('Error fetching budgets by date range');
  }
};
