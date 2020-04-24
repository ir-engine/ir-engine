import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const user = sequelizeClient.define('user', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
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
    (user as any).belongsTo(models.role);
    (user as any).belongsTo(models.instance); // user can only be in one room at a time
    (user as any).belongsTo(models.group, { through: 'group_user' }); // user can only be part of one group at a time
    (user as any).hasMany(models.collection);
    (user as any).hasMany(models.entity);
    (user as any).hasMany(models.resource);
    (user as any).belongsToMany(models.user, { as: 'owningUser', foreignKey: 'owningUserId', through: models.relationship });
    (user as any).belongsToMany(models.user, { as: 'relatedUser', foreignKey: 'relatedUserId', through: models.relationship });
    (user as any).belongsToMany(models.organization, { through: 'organization_user' }) // user can join multiple orgs
  }

  return user
}
