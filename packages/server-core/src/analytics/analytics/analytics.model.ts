import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { AnalyticsInterface } from '@xrengine/common/src/dbmodels/Analytics'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const analytics = sequelizeClient.define<Model<AnalyticsInterface>>(
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
