import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const component = sequelizeClient.define('component', {
    entity: {
      type: DataTypes.STRING, // TODO: ASSOCIATE AND CHANGE TYPE
      allowNull: false
    },
    type: {
      type: DataTypes.STRING, // TODO: ASSOCIATE AND CHANGE TYPE
      allowNull: false
    },
    data: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (component as any).associate = function (models: any) { }

  return component
}
