import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';
import { collectionType as collectionTypeEnum } from '../enums/collection';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const collectionType = sequelizeClient.define('collection_type', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
      values: Object.keys(collectionTypeEnum)
    }
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      },
      beforeUpdate (instance: any, options: any): void {
        throw new Error("Can't update a type!");
      }
    },
    timestamps: false
  });

  (collectionType as any).assocate = (models: any): void => {
    (collectionType as any).hasMany(models.collection, { foreignKey: 'collectionType' });
  };

  return collectionType;
};
