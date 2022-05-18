import { DataTypes, Model, Sequelize } from 'sequelize'

import { RouteInterface } from '@xrengine/common/src/dbmodels/Route'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Route = sequelizeClient.define<Model<RouteInterface>>(
    'route',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      project: {
        type: DataTypes.STRING
      },
      route: {
        type: DataTypes.STRING
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )
  ;(Route as any).associate = (models: any): void => {}

  return Route
}
