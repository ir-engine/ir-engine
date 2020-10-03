import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const attribution = sequelizeClient.define('attribution', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    creator: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      }
    }
  });

  (attribution as any).associate = (models: any): void => {
    (attribution as any).belongsTo(models.license);
    (attribution as any).belongsTo(models.collection);
    (attribution as any).belongsTo(models.static_resource);
  };

  return attribution;
};
