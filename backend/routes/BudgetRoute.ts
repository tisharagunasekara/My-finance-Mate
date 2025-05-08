import express from 'express';
import * as budgetController from '../controller/BudgetController';
import { generateBudgetReport } from '../controller/BudgetController'; // adjust path as needed

const router = express.Router();

router.post('/budgets', budgetController.createBudget);
router.get('/budgets/:userId', budgetController.getBudgets);
router.put('/budgets/:id', budgetController.updateBudget);
router.delete('/budgets/:id', budgetController.deleteBudget);
router.get('/reports/budgets/:userId', generateBudgetReport);

export default router;