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
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (entity as any).associate = (models: any) => {
    (entity as any).hasOne(models.entity_type);
    (entity as any).hasMany(models.component, { through: models.entity_component });
    (entity as any).belongsToMany(models.collection, { through: models.collection_entity })
  }

  return entity
}
