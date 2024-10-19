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


 //create Task
 export const createTask = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=> {
   const {title,description,dueDate,statusId} = req.body;
   const user = req.user;
   if(!user) {
    return next(new ApiError(400,ERROR_MESSAGES.USER_NOT_FOUND));
   }
   if(!title || !description || !dueDate) {
    return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
   }
   try {

  const status = await db.Status.findOne({
    where: {
        id: statusId
    }
  })
   const task = await db.Task.create({
       title,
       description,
       dueDate,
       statusId: status?.id as string,
       userId: req.user?.id as string
   });

   const response = new ApiResponse(201, { task }, SUCCESS_MESSAGES.TASK_CREATED_SUCCESSFULLY);
   res.status(201).json(response);
   }catch(error) {
    console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
    return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
   }

 });


 //update-task
 export const updateTask = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
  const { taskId, title, description, dueDate, statusId } = req.body;
  const user = req.user;

  if (!user) {
    return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
  }

  if (!taskId || !title || !description || !dueDate || !statusId) {
    return next(new ApiError(400, ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
  }

  try {
    const task = await db.Task.findOne({
      where: {
        id: taskId,
        userId: user.id,
      },
    });

    if (!task) {
      return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
    }

    const status = await db.Status.findOne({
      where: {
        id: statusId,
      },
    });

    if (!status) {
      return next(new ApiError(404, ERROR_MESSAGES.STATUS_NOT_FOUND));
    }

    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    task.statusId = status.id;
    
    await task.save();

    const response = new ApiResponse(200, { task }, SUCCESS_MESSAGES.TASK_UPDATED_SUCCESSFULLY);
    res.status(200).json(response);
  } catch (error) {
    console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
    return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
  }
});


//delete-task 
export const deleteTask = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
  const { taskId } = req.body;
  const user = req.user;

  if (!user) {
    return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
  }

  if (!taskId) {
    return next(new ApiError(400, ERROR_MESSAGES.TASK_ID_REQUIRED));
  }

  try {
    const task = await db.Task.findOne({
      where: {
        id: taskId,
        userId: user.id,
      },
    });

    if (!task) {
      return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
    }

    await task.destroy();

    const response = new ApiResponse(200, {}, SUCCESS_MESSAGES.TASK_DELETED_SUCCESSFULLY);
    res.status(200).json(response);
  } catch (error) {
    console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
    return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
  }
});

//get-All task
export const getAllTasks = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) {
    return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
  }

  try {
    const tasks = await db.Task.findAll({
      where: {
        userId: user.id,
      },
      include: [
        {
          model: db.Status, 
        },
      ],
      order: [['createdAt', 'DESC']], 
    });
    console.log(tasks)

    const response = new ApiResponse(200, { tasks }, SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY);
    res.status(200).json(response);
  } catch (error) {
    console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
    return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
  }
});


//get-task by ID
export const getTaskById = asyncHandler(async (req: MyUserRequest, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  const user = req.user;

  if (!user) {
    return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
  }

  if (!taskId) {
    return next(new ApiError(400, ERROR_MESSAGES.TASK_ID_REQUIRED));
  }

  try {
    const task = await db.Task.findOne({
      where: {
        id: taskId,
        userId: user.id,
      },
      include: [
        {
          model: db.Status,
        },
      ],
    });

    if (!task) {
      return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
    }

    const response = new ApiResponse(200, { task }, SUCCESS_MESSAGES.TASKS_RETRIEVED_SUCCESSFULLY);
    res.status(200).json(response);
  } catch (error) {
    console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
    return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
  }
});

