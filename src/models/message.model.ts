import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const message = sequelizeClient.define('message', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    text: {
      type: DataTypes.STRING,
      allowNull: false
    },
    conversationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isDelivered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      },
      afterBulkUpdate (options: any) {
        // eslint-disable-next-line no-prototype-builtins
        if (options.where.hasOwnProperty('id')) {
          app.service('message').Model.findOne({
            where: {
              id: options.where.id
            }
          })
            .then((message: any) => {
              app.service('message').emit('updated', {
                type: 'message updated',
                message: message
              })
            })
        }
      }
    }
  });

  (message as any).associate = (models: any): any => {
    (message as any).belongsTo(models.group, { through: 'group_message' });
    (message as any).belongsTo(models.conversation, { foreignKey: 'conversationId' });
    (message as any).belongsTo(models.user, { foreignKey: 'senderId', constraint: false });
    (message as any).hasMany(models.message_status, { foreignKey: 'messageId', constraint: false })
  }

  return message
}
