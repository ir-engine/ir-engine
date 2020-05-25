import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const conversation = sequelizeClient.define('conversation', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (conversation as any).associate = (models: any) => {
    (conversation as any).hasMany(models.message, { foreignKey: 'conversationId' });
    (conversation as any).belongsTo(models.conversation_type, { foreignKey: 'conversationType' }); // values: ['user', 'group', 'party'],
    (conversation as any).belongsTo(models.user, { foreignKey: 'senderId' });
    (conversation as any).belongsTo(models.user, { foreignKey: 'receiverId' }); // If type is 'user', key this
    (conversation as any).belongsTo(models.group, { foreignKey: 'groupId' }); // If type is 'group', key from this
    (conversation as any).belongsTo(models.party, { foreignKey: 'partyId' })
  }

  return conversation
}
