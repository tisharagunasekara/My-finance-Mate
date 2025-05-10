import { Request, Response } from 'express';
import Goal from '../models/GoalModel';
import mongoose from 'mongoose';

// Create a new goal
export const createGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, goalName, targetAmount, currentAmount, deadline, status, notes } = req.body;
    
    // Validate required fields
    if (!userId || !goalName || !targetAmount || !deadline) {
      res.status(400).json({ message: 'Missing required fields' });
      return;
    }
    
    // Validate amounts are numeric
    if (isNaN(Number(targetAmount)) || isNaN(Number(currentAmount))) {
      res.status(400).json({ message: 'Target amount and current amount must be numbers' });
      return;
    }
    
    // Create the goal with numeric values
    const goal = new Goal({
      userId,
      goalName,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      deadline,
      status,
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
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    const goals = await Goal.find({ userId });
    res.json(goals);
  } catch (error: any) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ message: 'Error fetching goals', error: error.message });
  }
};

// Update a goal
export const updateGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalName, targetAmount, currentAmount, deadline, status, notes } = req.body;
    
    // Validate amounts are numeric
    if (isNaN(Number(targetAmount)) || isNaN(Number(currentAmount))) {
      res.status(400).json({ message: 'Target amount and current amount must be numbers' });
      return;
    }
    
    // Find and update the goal with properly converted numeric values
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      {
        goalName,
        targetAmount: Number(targetAmount),
        currentAmount: Number(currentAmount),
        deadline,
        status,
        notes
      },
      { new: true, runValidators: true }
    );
    
    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }
    
    res.json(goal);
  } catch (error: any) {
    console.error('Error updating goal:', error);
    res.status(400).json({ message: 'Error updating goal', error: error.message });
  }
};

// Delete a goal
export const deleteGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);
    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting goal:', error);
    res.status(400).json({ message: 'Error deleting goal', error: error.message });
  }
};