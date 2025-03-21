import express from 'express';
import * as transactionController from '../controller/TransactionController';

const router = express.Router();

// CRUD operations for Transactions
router.post('/transactions', transactionController.createTransaction); // Create
router.get('/transactions/:userId', transactionController.getTransactionById); // Get by ID
router.put('/transactions/:id', transactionController.updateTransaction); // Update
router.delete('/transactions/:id', transactionController.deleteTransaction); // Delete

export default router;
