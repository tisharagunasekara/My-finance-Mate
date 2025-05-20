import express from 'express';
import * as budgetController from '../controller/BudgetController';

const router = express.Router();

router.post('/budgets', budgetController.createBudget);
router.get('/budgets/search', budgetController.getBudgets); // Search endpoint
router.get('/budgets/:userId', budgetController.getBudgetsByUser); // By userId
router.put('/budgets/:id', budgetController.updateBudget);
router.delete('/budgets/:id', budgetController.deleteBudget);
router.get('/reports/budgets/:userId', budgetController.generateBudgetReport);

export default router;
