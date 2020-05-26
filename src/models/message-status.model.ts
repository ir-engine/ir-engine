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
