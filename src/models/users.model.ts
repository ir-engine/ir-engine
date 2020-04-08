import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const users = sequelizeClient.define('users', {

    userId: {
      type: DataTypes.STRING,
      unique: true
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

    created: { type: DataTypes.DATE }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (users as any).associate = function (models: any) {
    (users as any).hasMany(models.xr_avatars)
    // belongs to many Groups
    // has one Contacts list
  }

  return users
}
