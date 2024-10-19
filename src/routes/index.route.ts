import { Router } from "express";
import userRoutes from '../routes/user.route';
import taskRoutes from '../routes/task.route';
import {BASE_API_ROUTES} from '../constants/routes.constants'
const router = Router();

router.use(BASE_API_ROUTES.USERS,userRoutes);
router.use(BASE_API_ROUTES.TASKS,taskRoutes);
export default router;