import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const entity = sequelizeClient.define('entity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    // We need to create additional id field for entity because this is being use by three.js
    entityId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parent: {
      type: DataTypes.UUID
    },
    index: DataTypes.INTEGER
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      }
    }
  });

  (entity as any).associate = (models: any): void => {
    (entity as any).hasMany(models.component, { foreignKey: 'entityId', onDelete: 'cascade', hooks: true });
    (entity as any).belongsTo(models.entity_type, { foreignKey: 'entityType', required: true });
    (entity as any).belongsTo(models.collection, { onDelete: 'cascade', hooks: true });
    (entity as any).belongsTo(models.user);
  };

  return entity;
};
