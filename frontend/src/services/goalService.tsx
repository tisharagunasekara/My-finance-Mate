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

/**
 * Create a new financial goal
 */
export const createGoal = async (userId: string, data: GoalData): Promise<GoalData> => {
  try {
    // Ensure numeric values are properly formatted as numbers
    const targetAmount = Number(data.targetAmount);
    const currentAmount = Number(data.currentAmount);
    
    // Validate status based on amounts
    let status = data.status;
    if (currentAmount >= targetAmount && targetAmount > 0) {
      status = 'achieved';
    } else if (status === 'achieved' && currentAmount < targetAmount) {
      status = 'in progress';
    }
    
    const goalData = {
      userId,
      goalName: data.goalName,
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      deadline: data.deadline,
      status: status,
      notes: data.notes
    };
    
    console.log('Creating goal with data:', goalData);
    const response = await axios.post(`${API_URL}/goals`, goalData);
    
    // Ensure returned data has proper numeric types
    return {
      ...response.data,
      targetAmount: Number(response.data.targetAmount),
      currentAmount: Number(response.data.currentAmount)
    };
  } catch (error) {
    console.error('Error creating goal:', error);
    throw new Error('Error creating goal');
  }
};

/**
 * Get financial goals by user ID
 */
export const getGoalsByUserId = async (userId: string): Promise<GoalData[]> => {
  try {
    const response = await axios.get(`${API_URL}/goals/${userId}`);
    
    // Ensure numeric values are properly formatted for each goal
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

/**
 * Update an existing financial goal
 */
export const updateGoal = async (goalId: string, data: GoalData): Promise<GoalData> => {
  try {
    // Remove _id from data to avoid MongoDB conflicts
    const { _id, progressPercentage, ...updateData } = data;
    
    // Ensure numeric values are properly formatted as numbers
    const targetAmount = Number(updateData.targetAmount);
    const currentAmount = Number(updateData.currentAmount);
    
    // Validate status based on amounts
    let status = updateData.status;
    if (currentAmount >= targetAmount && targetAmount > 0) {
      status = 'achieved';
    } else if (status === 'achieved' && currentAmount < targetAmount) {
      status = 'in progress';
    }
    
    const goalData = {
      ...updateData,
      targetAmount: targetAmount,
      currentAmount: currentAmount,
      status: status
    };
    
    console.log(`Updating goal ${goalId} with data:`, goalData);
    const response = await axios.put(`${API_URL}/goals/${goalId}`, goalData);
    
    // Ensure returned data has proper numeric types
    return {
      ...response.data,
      targetAmount: Number(response.data.targetAmount),
      currentAmount: Number(response.data.currentAmount)
    };
  } catch (error) {
    console.error('Error updating goal:', error);
    throw new Error('Error updating goal');
  }
};

/**
 * Delete a financial goal
 */
export const deleteGoal = async (goalId: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/goals/${goalId}`);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw new Error('Error deleting goal');
  }
};

/**
 * Get financial goals stats for dashboard
 */
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