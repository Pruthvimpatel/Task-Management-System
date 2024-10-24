import { Request, Response, NextFunction } from 'express';

import {ERROR_MESSAGES} from '../constants/message';
import User from '../models/user.model';
import ApiError from '../utils/api-error';

interface MyUserRequest extends Request {
    user?: User;
}


export const authorizeRole = (allowedRoles: string[]) => {
  return (req: MyUserRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new ApiError(401, ERROR_MESSAGES.UNAUTHORIZED_USER));
    }

    if (!allowedRoles.includes(user.role)) {
      return next(new ApiError(403, ERROR_MESSAGES.FORBIDDEN_ROLE));
    }
    next();
  };
};