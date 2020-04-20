import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const componentType = sequelizeClient.define('component_type', {
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

  (componentType as any).associate = (models: any) =>
    (componentType as any).belongsTo(models.component)

  return componentType
}
