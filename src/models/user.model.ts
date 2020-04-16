import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const user = sequelizeClient.define('user', {
    userId: {
      type: DataTypes.STRING,
      unique: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.STRING
    },
    auth0Id: { type: DataTypes.STRING },
    googleId: { type: DataTypes.STRING },
    facebookId: { type: DataTypes.STRING },
    twitterId: { type: DataTypes.STRING },
    githubId: { type: DataTypes.STRING },
    isVerified: { type: DataTypes.BOOLEAN },
    verifyToken: { type: DataTypes.STRING },
    verifyShortToken: { type: DataTypes.STRING },
    verifyExpires: { type: DataTypes.DATE },
    verifyChanges: { type: DataTypes.JSON },
    resetToken: { type: DataTypes.STRING },
    resetExpires: { type: DataTypes.DATE },
    created: { type: DataTypes.DATE }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });
  // belongs to many Group, has one Contact list
  (user as any).associate = (models: any) => {
    (user as any).hasMany(models.avatar);
    (user as any).hasMany(models.contact, { foreignKey: 'contactId', as: 'contactDetail', onDelete: 'CASCADE' })
  }

  return user
}
