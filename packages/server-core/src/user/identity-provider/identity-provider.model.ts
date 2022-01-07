import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const identityProvider = sequelizeClient.define(
    'identity_provider',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      token: { type: DataTypes.STRING, unique: true },
      password: { type: DataTypes.STRING },
      isVerified: { type: DataTypes.BOOLEAN },
      verifyToken: { type: DataTypes.STRING },
      verifyShortToken: { type: DataTypes.STRING },
      verifyExpires: { type: DataTypes.DATE },
      verifyChanges: { type: DataTypes.JSON },
      resetToken: { type: DataTypes.STRING },
      resetExpires: { type: DataTypes.DATE },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        values: ['email', 'sms', 'password', 'discord', 'github', 'google', 'facebook', 'twitter', 'linkedin', 'auth0']
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      },
      indexes: [
        {
          fields: ['id']
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
    }
  )

  ;(identityProvider as any).associate = (models: any): void => {
    ;(identityProvider as any).belongsTo(models.user, { required: true })
    ;(identityProvider as any).hasMany(models.login_token)
  }

  return identityProvider
}
