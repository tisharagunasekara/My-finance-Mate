import { Request, Response, NextFunction } from 'express';
import Budget from '../models/BudgetModel';
import mongoose from 'mongoose';

export const createBudget = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, category, amount, title, spent = 0 } = req.body;

        if (!userId || typeof userId !== 'string' || !mongoose.Types.ObjectId.isValid(userId)) {
            res.status(400).json({ error: 'Invalid userId format.' });
            return;
        }

        const percentageUsed = (spent / amount) * 100;

        const budget = new Budget({
            userId: new mongoose.Types.ObjectId(userId),
            category,
            amount,
            spent,
            percentageUsed,
            title
        });

        await budget.save();
        res.status(201).json(budget);
    } catch (error) {
        console.error('Error creating budget:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getBudgetsByUser = async (req: Request, res: Response) => {
    try {
        const budgets = await Budget.find({ userId: req.params.userId });
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getBudgets = async (req: Request, res: Response): Promise<void> => {
    try {
        const search = (req.query.search as string) || '';
        const query: any = {};

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [{ title: regex }, { category: regex }];
        }

        const budgets = await Budget.find(query).exec();
        res.status(200).json(budgets);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ message: 'Server error' });
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
        next(error);
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

export const generateBudgetReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const filter = userId === 'all' ? {} : { userId: new mongoose.Types.ObjectId(userId) };
        const budgets = await Budget.find(filter);

        const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);
        const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);

        const categoryMap: Record<string, { budget: number; spent: number }> = {};
        budgets.forEach((b) => {
            if (!categoryMap[b.category]) {
                categoryMap[b.category] = { budget: 0, spent: 0 };
            }
            categoryMap[b.category].budget += b.amount || 0;
            categoryMap[b.category].spent += b.spent || 0;
        });

        const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
            category,
            budget: data.budget,
            spent: data.spent
        }));

        const monthlyMap: Record<string, number> = {};
        budgets.forEach((b) => {
            const date = new Date(b.createdAt);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyMap[key] = (monthlyMap[key] || 0) + (b.spent || 0);
        });

        const monthlyTrends = Object.entries(monthlyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([month, spent]) => ({ month, spent }));

        res.status(200).json({
            totalBudget,
            totalSpent,
            categoryBreakdown,
            monthlyTrends
        });
    } catch (error) {
        console.error('Error generating budget report:', error);
        res.status(500).json({ error: 'Failed to generate budget report' });
    }
};
