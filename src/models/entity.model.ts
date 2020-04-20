import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const entity = sequelizeClient.define('entity', {
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
    (entity as any).hasMany(models.component);
    (entity as any).belongsToMany(models.collection, { through: 'collection_entity' })
  }

  return entity
}
