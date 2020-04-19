import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const collectionEntity = sequelizeClient.define('collection_entity', {
    connection: {
      type: DataTypes.STRING, // TODO: Reference type and associate
      allowNull: false
    },
    entity: {
      type: DataTypes.STRING, // TODO: Reference type and associate
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (collectionEntity as any).associate = function (models: any) {
  }

  return collectionEntity
}
