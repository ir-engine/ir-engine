import { Sequelize } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const collectionEntity = sequelizeClient.define('collection_entity', {
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (collectionEntity as any).associate = function (models: any) {
    (collectionEntity as any).hasOne(models.collection);
    (collectionEntity as any).hasOne(models.entity)
  }

  return collectionEntity
}
