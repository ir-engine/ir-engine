import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const collection = sequelizeClient.define('collection', {
    type: {
      type: DataTypes.STRING, // TODO: Reference type and associate
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING, // TODO: Reference type and associate
      allowNull: false
    },
    attribution: {
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
  (collection as any).associate = function (models: any) {
  }

  return collection
}
