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

    githubId: { type: DataTypes.STRING }

  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (users as any).associate = function (models: any) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (models) console.log(models)
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  }

  return users
}
