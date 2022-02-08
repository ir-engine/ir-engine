import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { UserRoleInterface } from '@xrengine/common/src/dbmodels/UserRole'

/**
 *
 * this model is associate with users
 * it contain role for users
 */
export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRole = sequelizeClient.define<Model<UserRoleInterface>>(
    'user_role',
    {
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      },
      timestamps: false
    }
  )

  ;(userRole as any).associate = (models: any): void => {
    ;(userRole as any).hasMany(models.user, { foreignKey: 'userRole' })
  }

  return userRole
}
