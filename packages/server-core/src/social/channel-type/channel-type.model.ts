import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const channelType = sequelizeClient.define(
    'channel_type',
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      },
      timestamps: false
    }
  )

  ;(channelType as any).associate = (models: any): void => {
    ;(channelType as any).hasMany(models.channel, { foreignKey: 'channelType' })
  }

  return channelType
}
