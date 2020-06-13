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
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (message as any).associate = (models: any): any => {
    (message as any).belongsTo(models.conversation, { foreignKey: 'conversationId', allowNull: false });
    (message as any).belongsTo(models.user, { foreignKey: 'senderId' });
    (message as any).hasMany(models.message_status)
  }

  return message
}
