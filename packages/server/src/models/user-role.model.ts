import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const userRole = sequelizeClient.define('user_role', {
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true
    }
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      }
    },
    timestamps: false
  });

  (userRole as any).associate = (models: any): void => {
    (userRole as any).hasMany(models.user, { foreignKey: 'userRole' });
  };

  return userRole;
};
