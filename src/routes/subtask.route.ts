import {Router} from 'express'; 
import {createSubtask,assignSubtask} from '../controllers/subtask.controller';
import {SUBTASK_ROUTES} from '../constants/routes.constants';
import {verifyToken} from '../middleware/auth.middleware';
import {authorizeRole} from '../middleware/authorization.middleware'

const router = Router();
router.post(SUBTASK_ROUTES.CREATE,verifyToken,authorizeRole(['ADMIN']),createSubtask);

router.post(SUBTASK_ROUTES.ASSIGN,verifyToken,authorizeRole(['ADMIN']),assignSubtask);


export default router;

