import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const license = sequelizeClient.define('license', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      }
    }
  });

  (license as any).associate = (models: any): void => {
    (license as any).hasMany(models.attribution);
  };

  return license;
};
