import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const identityProvider = sequelizeClient.define('identity_provider', {
    token: { type: DataTypes.STRING },
    password: { type: DataTypes.STRING },
    isVerified: { type: DataTypes.BOOLEAN },
    verifyToken: { type: DataTypes.STRING },
    verifyShortToken: { type: DataTypes.STRING },
    verifyExpires: { type: DataTypes.DATE },
    verifyChanges: { type: DataTypes.JSON },
    resetToken: { type: DataTypes.STRING },
    resetExpires: { type: DataTypes.DATE }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    },
    indexes: [
      {
        fields: ['userId']
      },
      {
        unique: true,
        fields: ['userId', 'token']
      },
      {
        unique: true,
        fields: ['userId', 'type']
      }
    ]
  });

  (identityProvider as any).associate = (models: any) => {
    (identityProvider as any).belongsTo(models.identity_provider_type, { foreignKey: 'type', required: true, primaryKey: true });
    (identityProvider as any).belongsTo(models.user, { required: true, primaryKey: true })
  }

  return identityProvider
}
