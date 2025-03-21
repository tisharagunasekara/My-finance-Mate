import express from 'express';
import * as goalController from '../controller/GoalController';

const router = express.Router();

router.post('/goals', goalController.createGoal);
router.get('/goals/:userId', goalController.getGoalsByUserId);
router.put('/goals/:id', goalController.updateGoal);
router.delete('/goals/:id', goalController.deleteGoal);

export default router;