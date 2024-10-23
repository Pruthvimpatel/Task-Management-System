import {Router} from 'express'; 
import {createTask,updateTask,deleteTask,getAllTasks,getTaskById,updateTaskStatus,setTaskDueDate,shareTask,moveTask,filterTask,bulkTaskCreate,assignBulkTask,bulkDeleteTask} from '../controllers/task.controller';
import {TASK_ROUTES} from '../constants/routes.constants';
import {authorizeRole} from '../middleware/authorization.middleware';
import {verifyToken} from '../middleware/auth.middleware';

const router = Router();

router.post(TASK_ROUTES.CREATE,verifyToken,authorizeRole(['ADMIN']),createTask);
router.post(TASK_ROUTES.UPDATE,verifyToken,authorizeRole(['ADMIN']),updateTask);
router.post(TASK_ROUTES.DELETE,verifyToken,authorizeRole(['ADMIN']),deleteTask);
router.get(TASK_ROUTES.GET_ALL,verifyToken,getAllTasks);
router.get(TASK_ROUTES.GET_BY_ID,verifyToken,getTaskById);
router.post(TASK_ROUTES.UPDATE_STATUS,verifyToken,updateTaskStatus);
router.post(TASK_ROUTES.SET_DUE_DATE,verifyToken,setTaskDueDate);
router.post(TASK_ROUTES.SHARE_TASK,authorizeRole(['ADMIN']),verifyToken,shareTask);
router.post(TASK_ROUTES.MOVE_TASK,verifyToken,moveTask);
router.get(TASK_ROUTES.FILTER_TASK,verifyToken,filterTask);
router.post(TASK_ROUTES.BULK_CREATE,authorizeRole(['ADMIN']),verifyToken,bulkTaskCreate);
router.post(TASK_ROUTES.BULK_ASSIGN,verifyToken,authorizeRole(['ADMIN']),assignBulkTask);
router.post(TASK_ROUTES.BULK_DELETE,verifyToken,authorizeRole(['ADMIN']),bulkDeleteTask);
export default router;