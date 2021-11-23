import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'
// import Location from './location.model'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instance = sequelizeClient.define(
    'instance',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      ipAddress: {
        type: DataTypes.STRING
      },
      channelId: {
        type: DataTypes.STRING
      },
      currentUsers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      ended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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

  ;(instance as any).associate = (models: any): void => {
    ;(instance as any).belongsTo(models.location, { foreignKey: { allowNull: true } })
    ;(instance as any).hasMany(models.user, { foreignKey: { allowNull: true } })
    ;(instance as any).hasOne(models.gameserver_subdomain_provision, { foreignKey: { allowNull: true } })
    ;(instance as any).hasMany(models.bot, { foreignKey: { allowNull: true } })
    ;(instance as any).belongsToMany(models.user, { through: 'instance_authorized_user' })
  }
  return instance
}
