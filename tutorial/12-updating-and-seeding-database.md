## Updating database models

Tooling for automatically updating the database based on changes in models is included in
[sequelize.ts](../packages/server-core/src/sequelize.ts). Most of it is controlled by setting
the environment variable `PREPARE_DATABSE=true`. 

If that is set, then the database setup will iterate through every model's fields and try
to match each one to a column. If it can't find an existing column, then one of two things will happen:

* If the model has a value `oldColumn` set on the field/foreignKey definition, and that old 
  column exists, then the old column will be renamed to the current name of the model field

The following is an example of [user.model.ts](../packages/server-core/src/user/user/user.model.ts)
where the field `inviteCode` will be renamed to `codeInvite`, and the association that was called
`channelInstanceId` is renamed to `instanceChannelId`. Note the `oldColumn` definition on each.
```
import { DataTypes, Sequelize, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { UserInterface } from '@xrengine/common/src/dbmodels/UserInterface'

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
      avatarId: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: false
      },
      codeInvite: {
        type: DataTypes.STRING,
        oldColumn: 'inviteCode',
        unique: true
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
    ;(User as any).belongsTo(models.user_role, { foreignKey: 'userRole' })
    ;(User as any).belongsTo(models.instance, { foreignKey: { allowNull: true } }) // user can only be in one room at a time
    ;(User as any).belongsTo(models.instance, { foreignKey: { name: 'instanceChannelId', oldColumn: 'channelInstanceId', allowNull: true } })
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
    ;(User as any).hasMany(models.scope, { foreignKey: 'userId' })
    ;(User as any).belongsToMany(models.instance, { through: 'instance_authorized_user' })
    ;(User as any).hasOne(models.user_api_key)
  }

  return User
}
```
* If the model doesn't have `oldColumn`, or it does and the old column doesn't exist, then it
  will add a new column

If the column does exist, then the current model for that column is applied to the column

## Seeding

Seeding happens if either `FORCE_DB_REFRESH=true` or `PREPARE_DATABASE=true`. Each seed template
is iterated over, and the database is checked to see if that template value exists. Seed templates
with IDs are checked via a singular .get(<id>), seed templates without an ID are checked via a
.find({ query: <template> }) (settings tables just check if there is a row present, and assumes
that its presence is indicative of being seeded already). If a seed template is not found, 
then it is inserted into the database.