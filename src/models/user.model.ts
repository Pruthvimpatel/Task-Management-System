import bcrypt from 'bcrypt';
import Sequelize, {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import db from '../sequelize-client';

export interface UserModelCreationAttributes {
    email: string;
    password: string;
    userName?: string;
}

export interface UserModelAttributes extends UserModelCreationAttributes {
    id: string;
    role: 'ADMIN' | 'USER';
}

export default class User extends Model<InferAttributes<User>,InferCreationAttributes<User>> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare password: string;
  declare userName: string;
  declare role: CreationOptional<'ADMIN' | 'USER'>;

  static associate: (models: typeof db) => void;

  static async hashPassword(user: User) {
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }
}

export const user = (
  sequelize: Sequelize.Sequelize,
  DataTypes: typeof Sequelize.DataTypes,
) => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('ADMIN', 'USER'),
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      paranoid: true,
      modelName: 'User',
      tableName: 'users',
      hooks: {
        beforeCreate: User.hashPassword,
        beforeUpdate: User.hashPassword,
      },
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  User.associate = models => {};

  return User;
};