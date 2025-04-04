import { Request, Response, NextFunction } from 'express';
import Budget from '../models/BudgetModel';
import mongoose from 'mongoose';

export const createBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, category, amount, title, spent = 0 } = req.body;

        console.log('Received userId:', userId); // Debugging Log

        // Check if userId exists and is a valid MongoDB ObjectId
        if (!userId || typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: 'Invalid userId format. Ensure it is a 24-character hex string.' });
            return;
        }

        const percentageUsed = (spent / amount) * 100;

        const budget = new Budget({
            userId: new mongoose.Types.ObjectId(userId), // Convert to ObjectId
            category,
            amount,
            spent,
            percentageUsed,
            title
        });

        await budget.save();
        res.status(201).json(budget);
    } catch (error) {
        console.error('Error creating budget:', error); // Log for debugging
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getBudgets = async (req: Request, res: Response) => {
    try {
        const budgets = await Budget.find({ userId: req.params.userId });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateBudget = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { spent, amount } = req.body;
        const percentageUsed = (spent / amount) * 100;

        const updatedBudget = await Budget.findByIdAndUpdate(
            req.params.id,
            { ...req.body, percentageUsed },
            { new: true }
        );

        if (!updatedBudget) {
            res.status(404).json({ message: 'Budget not found' });
            return;
        }

        res.status(200).json(updatedBudget);
    } catch (error) {
        next(error); // Pass the error to the next middleware
    }
};

export const deleteBudget = async (req: Request, res: Response) => {
    try {
        await Budget.findByIdAndDelete(req.params.id);
        res.json({ message: 'Budget deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
