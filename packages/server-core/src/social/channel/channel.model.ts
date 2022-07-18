import { DataTypes, Model, Sequelize } from 'sequelize'

import { ChannelInterface } from '@xrengine/common/src/dbmodels/Channel'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const channel = sequelizeClient.define<Model<Partial<ChannelInterface>>>(
    'channel',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
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

  ;(channel as any).associate = (models: any): void => {
    ;(channel as any).hasMany(models.message, { foreignKey: 'channelId', onDelete: 'cascade', hooks: true })
    ;(channel as any).belongsTo(models.user, { as: 'user1', foreignKey: 'userId1' })
    ;(channel as any).belongsTo(models.user, { as: 'user2', foreignKey: 'userId2' })
    ;(channel as any).belongsTo(models.group, { foreignKey: 'groupId' })
    ;(channel as any).belongsTo(models.party, { foreignKey: 'partyId', onDelete: 'cascade' })
    ;(channel as any).belongsTo(models.channel_type, { foreignKey: 'channelType', as: 'type', required: true })
    ;(channel as any).belongsTo(models.instance, { foreignKey: 'instanceId' })
  }

  return channel
}
