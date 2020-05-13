// @ts-ignore
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const entity = sequelizeClient.define('entity', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (entity as any).associate = (models: any) => {
    (entity as any).hasMany(models.component, { as: 'entity', foreignKey: 'entityId' });
    (entity as any).belongsTo(models.entity_type, { foreignKey: 'entityType', required: true });
    (entity as any).belongsTo(models.collection);
    (entity as any).belongsTo(models.user)
  }

  return entity
}
