import {Router} from 'express'; 
import {createSubtask} from '../controllers/subtask.controller';
import {SUBTASK_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';


const router = Router();
router.post(SUBTASK_ROUTES.CREATE,verifyToken,createSubtask);

export default router;
