import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const componentResource = sequelizeClient.define('component_resource', {
    text: {
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

  (componentResource as any).associate = function (models: any) {
    (componentResource as any).hasOne(models.component);
    (componentResource as any).hasOne(models.resource)
  }

  return componentResource
}
