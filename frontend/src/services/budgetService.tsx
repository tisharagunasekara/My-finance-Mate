import axios from 'axios';

const API_URL = "http://localhost:5001/api";

interface Budget {
  name: string;
  amount: number;
  spent: number; // New field
  percentageUsed: number; // New field
  category: string;
  date: string;
  notes?: string;
}

export const createBudget = async (userId: string, data: Budget) => {
  try {
    const response = await axios.post(`${API_URL}/budgets`, {
      userId,
      ...data
    });
    return response.data;
  } catch (error) {
    throw new Error('Error creating budget');
  }
};

export const getBudgets = async (userId: string, page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URL}/budgets/${userId}?page=${page}&size=${size}`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching budgets');
  }
};

export const getBudgetById = async (userId: string, budgetId: string) => {
  try {
    const response = await axios.get(`${API_URL}/budgets/${userId}/${budgetId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching budget');
  }
};

export const updateBudget = async (userId: string, budgetId: string, data: Budget) => {
  try {
    const response = await axios.put(`${API_URL}/budgets/${userId}/${budgetId}`, data);
    return response.data;
  } catch (error) {
    throw new Error('Error updating budget');
  }
};

export const deleteBudget = async (userId: string, budgetId: string) => {
  try {
    await axios.delete(`${API_URL}/budgets/${userId}/${budgetId}`);
    return true;
  } catch (error) {
    throw new Error('Error deleting budget');
  }
};

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
