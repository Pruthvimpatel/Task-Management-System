import { Router } from "express";
import userRoutes from '../routes/user.route';
import taskRoutes from '../routes/task.route';
import subtaskRoutes from '../routes/subtask.route';
import reminderRoutes from '../routes/reminder.route'
import {BASE_API_ROUTES} from '../constants/routes.constants'
const router = Router();

router.use(BASE_API_ROUTES.USERS,userRoutes);
router.use(BASE_API_ROUTES.TASKS,taskRoutes);
router.use(BASE_API_ROUTES.SUBTASKS,subtaskRoutes);
router.use(BASE_API_ROUTES.REMINDERS,reminderRoutes);
export default router;