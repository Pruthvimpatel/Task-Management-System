import {Router} from 'express'; 
import {createTask,updateTask,deleteTask,getAllTasks,getTaskById} from '../controllers/task.controller';
import {TASK_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';



const router = Router();
router.post(TASK_ROUTES.CREATE,verifyToken,createTask);
router.post(TASK_ROUTES.UPDATE,verifyToken,updateTask);
router.post(TASK_ROUTES.DELETE,verifyToken,deleteTask);
router.get(TASK_ROUTES.GET_ALL,verifyToken,getAllTasks);
router.get(TASK_ROUTES.GET_BY_ID,verifyToken,getTaskById);

export default router;