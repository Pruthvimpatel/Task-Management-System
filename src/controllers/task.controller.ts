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
import { Op } from 'sequelize';

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


//update task status
export const updateTaskStatus = asyncHandler(async(req: MyUserRequest,res: Response,next: NextFunction) => {
  const {taskId,statusId} = req.body;
   const user = req.user;
   if(!user) {
      return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
  }

  try {

const task = await db.Task.findOne({
  where: {
      id: taskId,
      userId: user.id
  }
});


if(!task) {
  return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));

}


const status = await db.Status.findByPk(statusId);
 if (!status) {
  return next(new ApiError(400, ERROR_MESSAGES.INVALID_STATUS_ID));
  }
 await task.update({ statusId });

 const response = new ApiResponse(200, { task }, SUCCESS_MESSAGES.TASK_STATUS_UPDATED_SUCCESSFULLY);
 res.status(200).json(response);
  }catch(error) {
      console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
      return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
  }
});

//set task due dates
export const setTaskDueDate = asyncHandler(async(req: MyUserRequest,res: Response,next: NextFunction) => {
  const {taskId,dueDate} = req.body;
   const user = req.user;
  if(!user) {
      return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
  }
  try {

const task = await db.Task.findOne({
  where: {
      id: taskId,
      userId: user.id
  }
});

if(!task) {
  return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
}

await task.update({ dueDate });
const response = new ApiResponse(200, { task }, SUCCESS_MESSAGES.TASK_DUE_DATE_SET_SUCCESSFULLY);
res.status(200).json(response);
  } catch(error) {
  console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
  return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
  }
});


//sharing task with other user
export const shareTask = asyncHandler(async(req:MyUserRequest,res: Response,next: NextFunction) => {
const {taskId,userId} = req.body;
const owner = req.user;

if(!owner){
  return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
}

try {

  const task = await db.Task.findOne({
    where: {
      id: taskId,
      userId: owner.id
    }
  });

  if (!task) {
    return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
}

const userToShare = await db.User.findByPk(userId)
if(!userToShare) {
  return next(new ApiError(404, ERROR_MESSAGES.USER_NOT_FOUND));
}

await db.TaskShare.create({
  taskId:task.id,
  userId
});


const response = new ApiResponse(200, { task }, SUCCESS_MESSAGES.TASK_SHARED_SUCCESSFULLY);
res.status(200).json(response);
} catch(error) {
  console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
  return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
}
})


//move task
export const moveTask = asyncHandler(async(req:MyUserRequest,res:Response,next: NextFunction) => {
  const taskId = req.params.taskId;
  const {statusId} = req.body;
  const user = req.user;
  if(!user) {
    return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
  }
  try {
    const task = await db.Task.findByPk(taskId);
    if(!task) {
      return next(new ApiError(404, ERROR_MESSAGES.TASK_NOT_FOUND));
    }
    const taskAssignment = await db.TaskShare.findOne({
      where: {
        taskId,
        userId: user.id
      }
    });

    const status = await db.Status.findByPk(statusId);

    if(!status) {
      return next(new ApiError(400, ERROR_MESSAGES.STATUS_NOT_FOUND));
    }
   await task.update({statusId});

   const response = new ApiResponse(200,{ task },SUCCESS_MESSAGES.TASK_MOVED_SUCCESSFULLY); 
   res.status(200).json(response);
   } catch(error) {
    console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
    return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
   }
});


//filter task
export const filterTask = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        statusId,
        dueDate,
        assigneeId,
        shared,
        page = 1,
        limit = 4,
        sortBy = 'createdAt',
        order = 'DESC',
      } = req.query;

      const whereCondition: any = {};
      if (statusId) {
        whereCondition.statusId = statusId;
      }

      if (dueDate) {
        whereCondition.dueDate = {
          [Op.lte]: new Date(dueDate as string),
        };
      }

      if (assigneeId) {
        whereCondition.userId = assigneeId;
      }

      if (shared) {
        const sharedUserId = shared as string;

        const sharedTasks = await db.TaskShare.findAll({
          attributes: ['taskId'],
          where: {
            userId: sharedUserId,
          },
        });

        if (sharedTasks.length === 0) {
          return next(
            new ApiError(404, ERROR_MESSAGES.NO_SHARED_TASKS_FOUND),
          );
        }

        whereCondition.id = {
          [Op.in]: sharedTasks.map((task: any) => task.taskId),
        };
      }

      const offset =
                (parseInt(page as string, 10) - 1) *
                parseInt(limit as string, 10);
      const limitValue = parseInt(limit as string, 10);

      const tasks = await db.Task.findAndCountAll({
        where: whereCondition,
        order: [[sortBy as string, order as string]],
        offset: offset,
        limit: limitValue,
      });

      res.json({
        tasks: tasks.rows,
        totalPages: Math.ceil(tasks.count / limitValue),
        currentPage: parseInt(page as string, 10),
        totalTasks: tasks.count,
      });
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [
          error,
        ]),
      );
    }
  },
);


//Creating bulk task
export const bulkTaskCreate = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction) => {
  const user = req.user;
  if(!user) {
    return next(new ApiError(400, ERROR_MESSAGES.USER_NOT_FOUND));
  }
  try {
    const tasks = req.body.tasks;

    if(!Array.isArray(tasks) || tasks.length === 0) {
      return next(new ApiError(400, ERROR_MESSAGES.TASK_NOT_FOUND));
    }

    const tasksWithUserId = tasks.map(task => ({
      ...task,
      userId: user.id,
    }));

    const createTasks = await db.Task.bulkCreate(tasksWithUserId, {
      returning: true
    });

    res.json(new ApiResponse(201,createTasks,SUCCESS_MESSAGES.TASK_CREATED_SUCCESSFULLY));

  } catch(error) {
    console.error(error);
    return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error,]),
    );
  }
  
})


//assign task in bulk
export const assignBulkTask = asyncHandler(
  async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    try {
      const { taskAssignment } = req.body;
      if (!Array.isArray(taskAssignment) || taskAssignment.length === 0) {
        return next(
          new ApiError(400, ERROR_MESSAGES.TASK_NOT_FOUND)
        );
      }

      const mappedTaskAssignments = taskAssignment.map((assignment: any) => ({
        taskId: assignment.taskId,
        userId: assignment.assigneeId
      }));

      await db.TaskShare.bulkCreate(mappedTaskAssignments, { returning: true });

      res.status(200).json(
        new ApiResponse(
          200,
          null,
          SUCCESS_MESSAGES.TASK_ASSIGNED_SUCCESSFULLY
        )
      );
    } catch (error) {
      console.error(error);
      return next(
        new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error])
      );
    }
  }
);

//Delete task in bulk

export const bulkDeleteTask = asyncHandler(
  async (req: MyUserRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }
  try {

    const { taskIds} = req.body;
    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return next(new ApiError(400, ERROR_MESSAGES.TASK_NOT_FOUND));
    }

    const deletedTasks = await db.Task.destroy({

      where : {
        id: taskIds
      }
  } );
  if (deletedTasks === 0) {
    return next(
      new ApiError(404, ERROR_MESSAGES.NO_TASKS_FOUND_TO_DELETE),
    );
  }
  res.status(200).json(
    new ApiResponse(
      200,
      null,
      SUCCESS_MESSAGES.TASK_DELETED_SUCCESSFULLY,
    ),
  );
  } catch(error) {
    console.error(error);
    return next(
      new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error])
    );
  }
}
)
