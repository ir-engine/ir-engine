import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const channel = sequelizeClient.define(
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
    ;(channel as any).belongsTo(models.party, { foreignKey: 'partyId' })
    ;(channel as any).belongsTo(models.channel_type, { foreignKey: 'channelType', as: 'type', required: true })
  }

  return channel
}
