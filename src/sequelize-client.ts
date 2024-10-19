import * as dotenv from 'dotenv'
dotenv.config();
import { DataTypes,Sequelize } from 'sequelize';

import config from './models/config';
import { user } from './models/user.model';
import {accessToken} from './models/access-token.model';
import {task} from './models/task.model';
import {status} from './models/status.model';
import {subtask} from './models/subtask.model';
import {taskShare} from './models/share-task.model';

const env = process.env.NODE_ENV || 'development';

type Model = (typeof db)[keyof typeof db]

type ModelWithAssociate = Model & { associate:(model: typeof db) => void }

const checkAssociation = (model: Model): model is ModelWithAssociate => {
    return 'associate' in model;
};

const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database,dbConfig.username, dbConfig.password,dbConfig);

const db = {
    sequelize: sequelize,
     User: user(sequelize,DataTypes),
     AccessToken: accessToken(sequelize,DataTypes),
     Task: task(sequelize,DataTypes),
     Status: status(sequelize,DataTypes),
     SubTask: subtask(sequelize,DataTypes),
     TaskShare: taskShare(sequelize,DataTypes),

     models: sequelize.models
};

Object.entries(db).forEach(([, model]: [string,Model]) => {
   if(checkAssociation(model)) {
    model.associate(db);
   } 
});

export default db;