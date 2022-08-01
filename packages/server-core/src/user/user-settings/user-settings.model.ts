import { DataTypes, Model, Sequelize } from 'sequelize'

import { UserSetting } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'

/**
 *
 * Model for database entity
 * this model contain users setting
 */

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const UserSettings = sequelizeClient.define<Model<UserSetting>>(
    'user_settings',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      themeModes: {
        type: DataTypes.JSON,
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

  ;(UserSettings as any).associate = (models: any): void => {
    ;(UserSettings as any).belongsTo(models.user, { primaryKey: true, required: true, allowNull: false })
  }

  return UserSettings
}
