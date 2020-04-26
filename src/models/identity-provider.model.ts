import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const identityProvider = sequelizeClient.define('identity_provider', {
    userId: {
      type: DataTypes.UUID,
      allowNull: false
    },

    token: {
      type: DataTypes.STRING
    },

    password: {
      type: DataTypes.STRING
    },

    accountType: {
      type: DataTypes.ENUM(
        'email',
        'sms',
        'password',
        'github',
        'google',
        'facebook',
        'auth0'
      ),
      allowNull: false
    },

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
      }
    ]
  });

  (identityProvider as any).associate = (models: any) => {
    (identityProvider as any).belongsTo(models.user)
  }

  return identityProvider
}
