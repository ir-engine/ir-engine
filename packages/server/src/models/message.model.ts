import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const message = sequelizeClient.define('message', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    text: {
      type: DataTypes.STRING(1023),
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      }
    }
  });

  (message as any).associate = (models: any): any => {
    (message as any).belongsTo(models.channel, { allowNull: false });
    (message as any).belongsTo(models.user, { foreignKey: 'senderId' });
    (message as any).hasMany(models.message_status, { onDelete: 'cascade', hooks: true });
  };

  return message;
};
