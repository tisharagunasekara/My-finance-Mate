import { Request, Response } from 'express';
import Transaction from "../models/TransactionModel";

// Create a new Transaction
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, category, amount, date, notes } = req.body;
    const transaction = new Transaction({
      userId,
      type,
      category,
      amount,
      date,
      notes,
    });

    const savedTransaction = await transaction.save();
    res.status(201).json(savedTransaction);
  } catch (error) {
    res.status(400).json({ message: 'Error creating transaction', error });
  }
};


// Get a Transaction by ID
export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params;

  try {
    const transactions = await Transaction.find({ userId }); // Fetch transactions by userId
    res.json(transactions); // Send the transactions back
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
  
};

// Update a Transaction
export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, category, amount, date, notes } = req.body;
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { type, category, amount, date, notes },
      { new: true }
    );
    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(200).json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Error updating transaction', error });
  }
};

// Delete a Transaction
export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      res.status(404).json({ message: 'Transaction not found' });
    }
    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting transaction', error });
  }
};
