import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const channel = sequelizeClient.define('channel', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (channel as any).associate = (models: any) => {
    (channel as any).hasMany(models.message, { foreignKey: 'channelId' });
    (channel as any).belongsTo(models.user, { foreignKey: 'userId1' });
    (channel as any).belongsTo(models.user, { foreignKey: 'userId2' });
    (channel as any).belongsTo(models.group, { foreignKey: 'groupId' });
    (channel as any).belongsTo(models.party, { foreignKey: 'partyId' });
    (channel as any).belongsTo(models.channel_type, { foreignKey: 'channelType', as: 'type', required: true });
    (channel as any).belongsTo(models.instance, { foreignKey: 'instanceId' })
  }

  return channel
}
