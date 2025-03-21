import { Request, Response } from 'express';
import Goal from '../models/GoalModel';

// Create a new goal
export const createGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, goalName, targetAmount, currentAmount, deadline, status, notes } = req.body;
    const goal = new Goal({
      userId,
      goalName,
      targetAmount,
      currentAmount,
      deadline,
      status,
      notes,
    });

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(400).json({ message: 'Error creating goal', error });
  }
};

// Get goals by user ID
export const getGoalsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const goals = await Goal.find({ userId });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals' });
  }
};

// Update a goal
export const updateGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goalName, targetAmount, currentAmount, deadline, status, notes } = req.body;
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { goalName, targetAmount, currentAmount, deadline, status, notes },
      { new: true }
    );
    if (!goal) {
      res.status(404).json({ message: 'Goal not found' });
      return;
    }
    res.json(goal);
  } catch (error) {
    res.status(400).json({ message: 'Error updating goal', error });
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
  } catch (error) {
    res.status(400).json({ message: 'Error deleting goal', error });
  }
};