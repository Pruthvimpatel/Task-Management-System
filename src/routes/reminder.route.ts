import { Router } from "express";
import {createReminder,updateReminder} from '../controllers/reminder.controller';
import {REMINDER_ROUTES} from '../constants/routes.constants';
import { verifyToken } from "../middleware/auth.middleware";
import {authorizeRole} from '../middleware/authorization.middleware';

const router = Router();

router.post(REMINDER_ROUTES.CREATE,verifyToken,authorizeRole(['ADMIN']),createReminder)

router.put(REMINDER_ROUTES.UPDATE_REMINDER,verifyToken,authorizeRole(['ADMIN']),updateReminder);

export default router

