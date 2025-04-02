import express from 'express';
import * as budgetController from '../controller/BudgetController';

const router = express.Router();

router.post('/budgets', budgetController.createBudget);
router.get('/budgets/:userId', budgetController.getBudgets);
router.put('/budgets/:id', budgetController.updateBudget);
router.delete('/budgets/:id', budgetController.deleteBudget);

export default router;