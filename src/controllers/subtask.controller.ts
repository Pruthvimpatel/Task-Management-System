import { Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import {generateAccessToken,generateRefreshToken,generateResetToken} from '../utils/jwt.token'
import encryption from '../utils/encryption';
import User from '../models/user.model';
import Status from '../models/status.model';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';
import sequelize from 'sequelize';


interface MyUserRequest extends Request {
    token?: string;
    user?: User;
 };

 export const createSubtask = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const { title, description, statusId, dueDate,taskId } = req.body;
    const user = req.user;

    if (!user) {
        return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
    }

    try {
        const task = await db.Task.findOne({ where: { id: taskId, userId: user.id } });

        if (!task) {
            return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
        }

        const status = await db.Status.findByPk(statusId);
        if (!status) {
            throw new ApiError(400, ERROR_MESSAGES.INVALID_STATUS_ID);
          }
        const subtask = await db.SubTask.create({
            title,
            description,
            statusId,
            taskId: task.id,
            dueDate,
        });

        const response = new ApiResponse(201, { subtask }, SUCCESS_MESSAGES.SUBTASK_CREATED_SUCCESSFULLY);
        res.status(201).json(response);
    } catch (error) {
        console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
        return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
});
