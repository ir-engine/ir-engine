const dotenv = require('dotenv')
const cli = require('cli')
const Sequelize = require('sequelize')

dotenv.config()
import { db } from '../server/db-config'

cli.enable('status')

cli.parse({
  email: [false, 'Email of user to make admin', 'string']
})

cli.main(async function(this: any, args: any, options: any) {
  try {
    const sequelizeClient = new Sequelize({
      ...db,
      logging: true,
      define: {
        freezeTableName: true
      }
    })

    await sequelizeClient.sync()

    const IdentityProvider = sequelizeClient.define('identity_provider', {
      token: {type: Sequelize.DataTypes.STRING},
      password: {type: Sequelize.DataTypes.STRING},
      isVerified: {type: Sequelize.DataTypes.BOOLEAN},
      verifyToken: {type: Sequelize.DataTypes.STRING},
      verifyShortToken: {type: Sequelize.DataTypes.STRING},
      verifyExpires: {type: Sequelize.DataTypes.DATE},
      verifyChanges: {type: Sequelize.DataTypes.JSON},
      resetToken: {type: Sequelize.DataTypes.STRING},
      resetExpires: {type: Sequelize.DataTypes.DATE},
      userId: {type: Sequelize.DataTypes.STRING}
    })

    const User = sequelizeClient.define('user', {
      id: {
        type: Sequelize.DataTypes.UUID,
        defaultValue: Sequelize.DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
      },
      userRole: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true
      }
    });

    const identityProviderMatch = await IdentityProvider.findOne({
      where: {
        token: options.email,
        type: 'email'
      }
    })

    if (identityProviderMatch == null) {
      throw new Error('No matching user with email ' + options.email)
    }

    const userMatch = await User.findOne({
      where: {
        id: identityProviderMatch.userId
      }
    })

    userMatch.userRole = 'admin'
    await userMatch.save()

    this.ok('User with email ' + options.email + ' and ID ' + identityProviderMatch.userId + ' made an admin')
    process.exit(0);
  }
  catch (err) {
    this.fatal(err)
  }
})
