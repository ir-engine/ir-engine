import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const entityType = sequelizeClient.define('entity_type', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true
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

  (entityType as any).assocate = (models: any): void => {
    (entityType as any).hasMany(models.entity, { foreignKey: 'entityType' });
  };
  return entityType;
};
