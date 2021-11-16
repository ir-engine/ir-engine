import { Application } from '@xrengine/server-core/declarations'
import { DataTypes, Sequelize } from 'sequelize'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Profile = sequelizeClient.define(
    'profile',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      teamName: {
        type: DataTypes.STRING,
        defaultValue: (): string => '',
        allowNull: false,
        unique: false
      },
      coins: {
        type: DataTypes.INTEGER
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

  ;(Profile as any).associate = (models: any): void => {
    ;(Profile as any).belongsTo(models.user, { as: 'user', required: true, constraints: false })
    ;(Profile as any).belongsTo(models.static_resource, { as: 'avatar', required: false, constraints: false })
  }

  return Profile
}
