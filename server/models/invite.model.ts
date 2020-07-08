// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';

export default function (app: Application) {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const invite = sequelizeClient.define('invite', {
    token: {
      type: DataTypes.STRING
    },
    identityProviderType: {
      type: DataTypes.STRING
    },
    passcode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    targetObjectId: {
      type: DataTypes.STRING
    }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (invite as any).associate = function (models: any) {
    (invite as any).belongsTo(models.user);
    (invite as any).belongsTo(models.user, { as: 'invitee'});
    (invite as any).belongsTo(models.invite_type, { foreignKey: 'type', required: true });
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  };

  return invite;
}
