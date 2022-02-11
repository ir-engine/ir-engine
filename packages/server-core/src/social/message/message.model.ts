import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { MessageInterface } from '@xrengine/common/src/dbmodels/Message'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const message = sequelizeClient.define<Model<MessageInterface>>(
    'message',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      text: {
        type: DataTypes.STRING(1023),
        allowNull: false
      },
      isNotification: {
        type: DataTypes.BOOLEAN
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

  ;(message as any).associate = (models: any): any => {
    ;(message as any).belongsTo(models.channel, { allowNull: false })
    ;(message as any).belongsTo(models.user, { foreignKey: 'senderId', as: 'sender' })
    ;(message as any).hasMany(models.message_status, { onDelete: 'cascade', hooks: true })
  }

  return message
}
