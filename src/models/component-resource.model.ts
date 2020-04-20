import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const componentResource = sequelizeClient.define('component_resource', {
    resource: {
      type: DataTypes.STRING, // TODO: Reference type and associate
      allowNull: false
    },
    component: {
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
  (componentResource as any).associate = function (models: any) {
  }

  return componentResource
}
