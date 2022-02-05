import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

/**
 * This model contain users information
 */
export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const UserApiKey = sequelizeClient.define(
    'user_api_key',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      token: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
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

  ;(UserApiKey as any).associate = (models: any): void => {
    ;(UserApiKey as any).belongsTo(models.user, { foreignKey: { allowNull: false, onDelete: 'cascade', unique: true } })
  }

  return UserApiKey
}
