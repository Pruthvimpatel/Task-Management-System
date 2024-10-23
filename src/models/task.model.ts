import Sequelize, { CreationOptional, ForeignKey, Model } from 'sequelize';

import db from '../sequelize-client';

import Status from './status.model';
import User from './user.model';
import TaskShare from './share-task.model';

export interface TaskModelCreationAttributes {
    title: string;
    description?: string;
    statusId: string;
    userId: string;
    dueDate?: Date;
}

export interface TaskModelAttributes extends TaskModelCreationAttributes {
    id: string;
}

export default class Task
  extends Model<TaskModelAttributes, TaskModelCreationAttributes>
  implements TaskModelAttributes {
  declare id: CreationOptional<string>;
  declare title: string;
  declare description?: string;
  declare statusId: ForeignKey<Status['id']>;
  declare userId: ForeignKey<User['id']>;
  declare dueDate?: Date;

  declare user?: User;
  declare status?: Status;
  declare sharedUsers?: TaskShare[];

  static associate: (models: typeof db) => void;
}


export const task = (
  sequelize: Sequelize.Sequelize,
  DataTypes: typeof Sequelize.DataTypes,
) => {
  Task.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      statusId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'status_id',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      modelName: 'Task',
      tableName: 'tasks',
      paranoid: true,
    },
  );
  Task.associate = models => {
    Task.belongsTo(models.Status, { foreignKey: 'statusId' });
    Task.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Task.hasMany(models.TaskShare, { foreignKey: 'taskId', as: 'sharedUsers'});
    Task.hasMany(models.SubTask, { as: 'subtasks', foreignKey: 'taskId' });
  };


  return Task;
};