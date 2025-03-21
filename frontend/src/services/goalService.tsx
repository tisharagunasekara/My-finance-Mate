import axios from 'axios';

const API_URL = "http://localhost:5000/api";

interface GoalData {
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
  notes?: string;
}

export const createGoal = async (userId: string, data: GoalData) => {
  try {
    const response = await axios.post(`${API_URL}/goals`, {
      userId,
      ...data
    });
    return response.data;
  } catch (error) {
    throw new Error('Error creating goal');
  }
};

export const getGoalsByUserId = async (userId: string) => {
  try {
    const response = await axios.get(`${API_URL}/goals/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error fetching goals');
  }
};

export const updateGoal = async (goalId: string, data: GoalData) => {
  try {
    const response = await axios.put(`${API_URL}/goals/${goalId}`, data);
    return response.data;
  } catch (error) {
    throw new Error('Error updating goal');
  }
};

export const deleteGoal = async (goalId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/goals/${goalId}`);
    return response.data;
  } catch (error) {
    throw new Error('Error deleting goal');
  }
};