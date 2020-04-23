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
    mobile: {
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

  (user as any).associate = (models: any) => {
    (user as any).belongsToMany(models.user, { through: models.relationship, foreignKey: 'user', as: 'userOne' });
    (user as any).belongsToMany(models.user, { through: models.relationship, foreignKey: 'user', as: 'userTwo' });

    (user as any).hasMany(models.asset, { foreignKey: 'accountId' });
    (user as any).hasMany(models.owned_files, { foreignKey: 'accountId' });
    (user as any).belongsTo(models.group, { through: models.group_member })
  }

  return user
}
