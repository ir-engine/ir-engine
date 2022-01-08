import { DataTypes, Sequelize } from 'sequelize'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const analytics = sequelizeClient.define(
    'analytics',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      count: {
        type: DataTypes.INTEGER
      },
      type: {
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

  ;(analytics as any).associate = (models: any): void => {}
  return analytics
}
