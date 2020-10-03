import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const UserSettings = sequelizeClient.define('user_settings', {
    microphone: { type: DataTypes.STRING },
    audio: { type: DataTypes.STRING }
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      }
    }
  });

  (UserSettings as any).associate = (models: any): void => {
    (UserSettings as any).belongsTo(models.user, { primaryKey: true, required: true, allowNull: false });
  };

  return UserSettings;
};
