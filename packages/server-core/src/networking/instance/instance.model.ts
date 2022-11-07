import { DataTypes, Model, Sequelize } from 'sequelize'

import { InstanceInterface } from '@xrengine/common/src/dbmodels/Instance'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const instance = sequelizeClient.define<Model<InstanceInterface>>(
    'instance',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      roomCode: {
        type: DataTypes.STRING,
        allowNull: false
      },
      ipAddress: {
        type: DataTypes.STRING
      },
      channelId: {
        type: DataTypes.STRING
      },
      podName: {
        type: DataTypes.STRING
      },
      currentUsers: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      ended: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      assigned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      assignedAt: {
        type: DataTypes.DATE
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
    ;(instance as any).hasOne(models.instanceserver_subdomain_provision, { foreignKey: { allowNull: true } })
    ;(instance as any).hasMany(models.bot, { foreignKey: { allowNull: true } })
    ;(instance as any).belongsToMany(models.user, { as: 'instanceAuthorizedUser', through: 'instance_authorized_user' })
    ;(instance as any).hasMany(models.instance_authorized_user, { foreignKey: { allowNull: false } })
  }
  return instance
}
