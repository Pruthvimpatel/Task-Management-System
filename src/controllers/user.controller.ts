import { Request, Response, NextFunction} from 'express';
import bcrypt from 'bcrypt';
import ApiError from '../utils/api-error';
import ApiResponse from '../utils/api-response';
import asyncHandler from '../utils/async-handler';
import db  from '../sequelize-client';
import {generateAccessToken,generateRefreshToken,generateResetToken} from '../utils/jwt.token'
import encryption from '../utils/encryption';
import User from '../models/user.model';
import {ERROR_MESSAGES,SUCCESS_MESSAGES} from  '../constants/message';
import sequelize from 'sequelize';


interface MyUserRequest extends Request {
   token?: string;
   user?: User;
};

// User-Register
export const registerUser = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const{userName,email,password,role} = req.body;
    if(!userName || !password || !email ||!role) {
        return next(new ApiError(400,ERROR_MESSAGES.ALL_FIELDS_REQUIRED));
    }
    try {
   const newUser = await db.User.create({email,password,userName,role});
   const response = new ApiResponse(201,newUser,SUCCESS_MESSAGES.USER_REGISTERED_SUCCESSFULLY);
   res.status(201).json(response);
    } catch(error) {
        console.error(ERROR_MESSAGES.SOMETHING_ERROR,error);
        return next(new ApiError(500,ERROR_MESSAGES.INTERNAL_SERVER_ERROR,[error]));
    }
})
    
//User-Login
export const loginUser = asyncHandler(async(req:Request,res:Response,next:NextFunction) => {
    const {email,password} = req.body;
  
    if (!email || !password) {
      return next(new ApiError(400, ERROR_MESSAGES.EMAIL_AND_PASSWORD_REQUIRED));
    }
  
    try {
      const user = await db.User.findOne({where: {email}});
      if(!user)
      {
          return next(new ApiError(404, ERROR_MESSAGES.USER_NOT_FOUND)); 
      }
      const isMatch = await bcrypt.compare(password,user.password);
      if (!isMatch) {
          return next(new ApiError(401, ERROR_MESSAGES.INVALID_CREDENTIALS));
        };
      const accessToken = generateAccessToken({userId:user.id,email:user.email});
      const refreshToken = generateRefreshToken({ userId: user.id });
      
      const encryptedAccessToken = encryption.encryptWithAES(accessToken);
      const encryptedRefreshToken = encryption.encryptWithAES(refreshToken);
  
      await db.AccessToken.bulkCreate([
          {
              tokenType: 'ACCESS',
              token: encryptedAccessToken,
              userId: user.id,
              expiredAt: new Date(Date.now() + 60 * 60 * 1000),
            },
            {
              tokenType: 'REFRESH',
              token: encryptedRefreshToken,
              userId: user.id,
              expiredAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            }
      ]);
      const response = new ApiResponse(201,{accessToken,user},SUCCESS_MESSAGES.USER_LOGIN_SUCCESSFULLY);
      res.status(200).send(response);
    } catch(error) {
      console.error(ERROR_MESSAGES.SOMETHING_ERROR, error);
      return next(new ApiError(500, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, [error]));
    }
})

//User-Logout
export const logout  = asyncHandler(async(req:MyUserRequest,res:Response,next:NextFunction)=>{
    const token = req.token;
    if(!token) {
     return next(new ApiError(401,ERROR_MESSAGES.TOKEN_NOT_FOUND));
    }
    
    try {

        const encryptedToken = encryption.encryptWithAES(token);
  
     const  deleteToken = await db.AccessToken.destroy({
         where: {
             token:encryptedToken,
             tokenType: 'ACCESS'
         }
     });
 
     if(deleteToken == 0) {
         return next(new ApiError(401,ERROR_MESSAGES.TOKEN_NOT_FOUND));
     }
 
     await db.AccessToken.destroy({
         where: {
             userId: req.user?.id,
             tokenType: 'REFRESH'
         }
     });
 
  const response = new ApiResponse(200,SUCCESS_MESSAGES.USER_LOGOUT_SUCCESSFULLY);
   res.status(200).json(response);
 
    }catch (error) {
     console.error(ERROR_MESSAGES.SOMETHING_ERROR);
     return next(new ApiError(500,ERROR_MESSAGES.SOMETHING_ERROR));
    }
 });
 





