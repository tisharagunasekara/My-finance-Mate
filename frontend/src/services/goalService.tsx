import axios from 'axios';

const API_URL = "http://localhost:5001/api";

export interface GoalData {
  _id?: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: string;
  notes?: string;
  progressPercentage?: number;
}

// Create a new goal
export const createGoal = async (userId: string, data: GoalData): Promise<GoalData> => {
  try {
    // Ensure numeric values are properly passed as numbers
    const goalData = {
      userId,
      goalName: data.goalName,
      targetAmount: Number(data.targetAmount),
      currentAmount: Number(data.currentAmount),
      deadline: data.deadline,
      status: data.status,
      notes: data.notes
    };
    
    console.log('Creating goal with data:', goalData);
    const response = await axios.post(`${API_URL}/goals`, goalData);
    return response.data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw new Error('Error creating goal');
  }
};

// Get goals by user ID
export const getGoalsByUserId = async (userId: string): Promise<GoalData[]> => {
  try {
    const response = await axios.get(`${API_URL}/goals/${userId}`);
    
    // Ensure numeric values are properly parsed
    const goals = response.data.map((goal: any) => ({
      ...goal,
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount)
    }));
    
    return goals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw new Error('Error fetching goals');
  }
};

// Update an existing goal
export const updateGoal = async (goalId: string, data: GoalData): Promise<GoalData> => {
  try {
    // Remove _id from data to avoid MongoDB conflicts
    const { _id, ...updateData } = data;
    
    // Ensure numeric values are properly passed as numbers
    const goalData = {
      ...updateData,
      targetAmount: parseFloat(String(updateData.targetAmount || 0)),
      currentAmount: parseFloat(String(updateData.currentAmount || 0)),
    };
    
    console.log('Updating goal API call with data:', goalData);
    
    const response = await axios.put(`${API_URL}/goals/${goalId}`, goalData);
    
    // Ensure the returned data also has properly formatted number values
    const formattedResponse = {
      ...response.data,
      targetAmount: parseFloat(String(response.data.targetAmount || 0)),
      currentAmount: parseFloat(String(response.data.currentAmount || 0)),
    };
    
    return formattedResponse;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw new Error('Error updating goal');
  }
};

// Delete a goal
export const deleteGoal = async (goalId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/goals/${goalId}`);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw new Error('Error deleting goal');
  }
};

// Get goals stats (for dashboard widgets)
export const getGoalsStats = async (userId: string): Promise<any> => {
  try {
    const goals = await getGoalsByUserId(userId);
    
    const totalGoals = goals.length;
    const completedGoals = goals.filter(g => g.status.toLowerCase() === 'achieved').length;
    const totalTargetAmount = goals.reduce((sum, goal) => sum + Number(goal.targetAmount), 0);
    const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0);
    const averageProgress = totalTargetAmount > 0 
      ? (totalSaved / totalTargetAmount) * 100
      : 0;
      
    return {
      totalGoals,
      completedGoals,
      inProgressGoals: totalGoals - completedGoals,
      totalTargetAmount,
      totalSaved,
      averageProgress: Math.round(averageProgress * 10) / 10
    };
  } catch (error) {
    console.error('Error calculating goals stats:', error);
    throw new Error('Error calculating goals stats');
  }
};