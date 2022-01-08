import { DataTypes, Sequelize } from 'sequelize'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const group = sequelizeClient.define(
    'group',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        defaultValue: 'My shiny new group'
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

  ;(group as any).associate = (models: any): void => {
    ;(group as any).belongsToMany(models.user, { through: 'group_user' }) // user can join multiple orgs
    ;(group as any).hasMany(models.group_user, { unique: false, onDelete: 'cascade', hooks: true })
    ;(group as any).hasOne(models.channel, { onDelete: 'cascade', hooks: true })
    ;(group as any).hasMany(models.scope, { foreignKey: 'groupId' })
  }

  return group
}
