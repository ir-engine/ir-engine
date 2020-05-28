import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const messageStatus = sequelizeClient.define('message_status', {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true
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
        // It wiil update relevent message status
        // eslint-disable-next-line no-prototype-builtins
        if (options.where.hasOwnProperty('id')) {
          const updatedProp = options.fields[0]
          if (options.attributes[updatedProp]) {
            app.service('message-status').Model.findOne({
              where: {
                id: options.where.id
              }
            })
              .then((messageStatus: any) => {
                app.service('message-status').Model.findAll({
                  where: {
                    messageId: messageStatus.messageId,
                    [updatedProp]: false
                  }
                })
                  .then((response: any) => {
                    if (response.length === 0) {
                      app.service('message').Model.update(
                        {
                          [updatedProp]: true
                        },
                        {
                          where: {
                            id: messageStatus.messageId
                          }
                        }
                      )
                    }
                  })
              })
          }
        }
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (messageStatus as any).associate = function (models: any) {
    (messageStatus as any).belongsTo(models.message);
    (messageStatus as any).belongsTo(models.user, { foreignKey: 'recipientId', constraint: false })
  }

  return messageStatus
}
