import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../../../declarations';

/**
 * 
 * this model is associate with users 
 * it contain project for user
 */
export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const userProject = sequelizeClient.define('user_project', {
    project_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      }
    },
    timestamps: false
  });

  (userProject as any).associate = (models: any): void => {
    (userProject as any).hasMany(models.user, { foreignKey: 'project_id' });
  };

  return userProject;
};
