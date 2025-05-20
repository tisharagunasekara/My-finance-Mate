import { Request, Response } from 'express';
import Goal from '../models/GoalModel';
import mongoose from 'mongoose';

// Create a new goal
export const createGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, goalName, targetAmount, currentAmount, deadline, status, notes } = req.body;
    
    // Validate required fields
    if (!userId || !goalName || targetAmount === undefined || currentAmount === undefined || !deadline) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    
    // Validate amounts are numeric and convert them
    const parsedTargetAmount = Number(targetAmount);
    const parsedCurrentAmount = Number(currentAmount);
    
    if (isNaN(parsedTargetAmount) || isNaN(parsedCurrentAmount)) {
      res.status(400).json({ 
        message: 'Target amount and current amount must be valid numbers',
        receivedTarget: targetAmount,
        receivedCurrent: currentAmount
      });
      return;
    }
    
    // Validate status based on progress (server-side validation)
    let validatedStatus = status;
    
    // If current amount meets or exceeds target, status should be achieved
    if (parsedCurrentAmount >= parsedTargetAmount && parsedTargetAmount > 0) {
      validatedStatus = 'achieved';
    } 
    // If status is achieved but current amount is less than target, status should be in progress
    else if (validatedStatus === 'achieved' && parsedCurrentAmount < parsedTargetAmount) {
      validatedStatus = 'in progress';
    }
    
    // Validate status is one of allowed values
    if (!['in progress', 'achieved'].includes(validatedStatus)) {
      validatedStatus = 'in progress'; // default to in progress for invalid statuses
    }
    
    // Create the goal
    const goal = new Goal({
      userId,
      goalName,
      targetAmount: parsedTargetAmount,
      currentAmount: parsedCurrentAmount,
      deadline,
      status: validatedStatus,
      notes,
    });

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error: any) {
    console.error('Error creating goal:', error);
    res.status(400).json({ message: 'Error creating goal', error: error.message });
  }
};

// Get goals by user ID
export const getGoalsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!userId) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }
    
    // Find goals by userId
    const goals = await Goal.find({ userId });
    
    // Return goals with numeric values properly formatted
    const formattedGoals = goals.map(goal => ({
      ...goal.toObject(),
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount)
    }));
    
    res.json(formattedGoals);
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
};

// Update a goal
export const updateGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { goalName, targetAmount, currentAmount, deadline, status, notes } = req.body;
    
    // Validate goal ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid goal ID' });
      return;
    }
    
    // Validate required fields
    if (!goalName || targetAmount === undefined || currentAmount === undefined || !deadline || !status) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    
    // Validate amounts are numeric and convert them
    const parsedTargetAmount = Number(targetAmount);
    const parsedCurrentAmount = Number(currentAmount);
    
    if (isNaN(parsedTargetAmount) || isNaN(parsedCurrentAmount)) {
      res.status(400).json({ 
        message: 'Target amount and current amount must be valid numbers',
        receivedTarget: targetAmount,
        receivedCurrent: currentAmount
      });
      return;
    }
    
    // Validate status based on progress (server-side validation)
    let validatedStatus = status;
    
    // If current amount meets or exceeds target, status should be achieved
    if (parsedCurrentAmount >= parsedTargetAmount && parsedTargetAmount > 0) {
      validatedStatus = 'achieved';
    } 
    // If status is achieved but current amount is less than target, status should be in progress
    else if (validatedStatus === 'achieved' && parsedCurrentAmount < parsedTargetAmount) {
      validatedStatus = 'in progress';
    }
    
    // Validate status is one of allowed values
    if (!['in progress', 'achieved'].includes(validatedStatus)) {
      validatedStatus = 'in progress'; // default to in progress for invalid statuses
    }
    
    // Find and update the goal
    const goal = await Goal.findByIdAndUpdate(
      id,
      {
        goalName,
        targetAmount: parsedTargetAmount,
        currentAmount: parsedCurrentAmount,
        deadline,
        status: validatedStatus,
        notes
      },
      { new: true, runValidators: true }
    );
    
    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }
    
    // Return updated goal with numeric values properly formatted
    const formattedGoal = {
      ...goal.toObject(),
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount)
    };
    
    res.json(formattedGoal);
  } catch (error: any) {
    console.error('Error updating goal:', error);
    res.status(400).json({ message: 'Error updating goal', error: error.message });
  }
};

// Delete a goal
export const deleteGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate goal ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid goal ID' });
      return;
    }
    
    const goal = await Goal.findByIdAndDelete(id);
    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }
    
    res.json({ message: 'Goal deleted successfully', id });
  } catch (error: any) {
    console.error('Error deleting goal:', error);
    res.status(400).json({ message: 'Error deleting goal', error: error.message });
  }
};