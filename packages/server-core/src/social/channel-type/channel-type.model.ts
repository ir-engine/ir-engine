import { DataTypes, Model, Sequelize } from 'sequelize'

import { ChannelTypeInterface } from '@xrengine/common/src/dbmodels/ChannelType'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const channelType = sequelizeClient.define<Model<ChannelTypeInterface>>(
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
