import { DataTypes, Model, Sequelize } from 'sequelize'

import { UserInterface } from '@xrengine/common/src/dbmodels/UserInterface'

import { Application } from '../../../declarations'

/**
 * This model contain users information
 */
export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const User = sequelizeClient.define<Model<UserInterface>>(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: (): string => 'Guest #' + Math.floor(Math.random() * (999 - 100 + 1) + 100),
        allowNull: false
      },
      isGuest: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      inviteCode: {
        type: DataTypes.STRING,
        unique: true
      },
      did: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )

  ;(User as any).associate = (models: any): void => {
    ;(User as any).belongsTo(models.instance, { as: 'instance', foreignKey: { name: 'instanceId', allowNull: true } }) // user can only be in one room at a time
    ;(User as any).belongsTo(models.instance, {
      as: 'channelInstance',
      foreignKey: { name: 'channelInstanceId', allowNull: true }
    })
    ;(User as any).hasOne(models.user_settings)
    ;(User as any).belongsTo(models.party, { through: 'party_user' }) // user can only be part of one party at a time
    ;(User as any).belongsToMany(models.user, {
      as: 'relatedUser',
      through: models.user_relationship
    })
    ;(User as any).hasMany(models.user_relationship, { onDelete: 'cascade' })
    ;(User as any).belongsToMany(models.group, { through: 'group_user' }) // user can join multiple orgs
    ;(User as any).hasMany(models.group_user, { unique: false, onDelete: 'cascade' })
    ;(User as any).hasMany(models.identity_provider, { onDelete: 'cascade' })
    ;(User as any).hasMany(models.static_resource)
    // (User as any).hasMany(models.subscription);
    ;(User as any).hasMany(models.channel, { foreignKey: 'userId1', onDelete: 'cascade' })
    ;(User as any).hasMany(models.channel, { foreignKey: 'userId2', onDelete: 'cascade' })
    // (User as any).hasOne(models.seat, { foreignKey: 'userId' });
    ;(User as any).belongsToMany(models.location, { through: 'location_admin' })
    ;(User as any).hasMany(models.location_admin, { unique: false })
    ;(User as any).hasMany(models.location_ban)
    ;(User as any).hasMany(models.bot, { foreignKey: 'userId' })
    ;(User as any).hasMany(models.scope, { foreignKey: 'userId', onDelete: 'cascade' })
    ;(User as any).belongsToMany(models.instance, { through: 'instance_authorized_user' })
    ;(User as any).hasOne(models.user_api_key)
    ;(User as any).belongsTo(models.avatar)
  }

  return User
}
