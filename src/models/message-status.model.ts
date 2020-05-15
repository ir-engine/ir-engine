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
    recipientId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    messageId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (messageStatus as any).associate = function (models: any) {
    (messageStatus as any).belongsTo(models.messages, { foreignKey: 'messageId' })
  }

  return messageStatus
}
