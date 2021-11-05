import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const groupUser = sequelizeClient.define(
    'group_user',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
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

  ;(groupUser as any).associate = (models: any): void => {
    ;(groupUser as any).belongsTo(models.group_user_rank, { foreignKey: 'groupUserRank', as: 'rank', required: true })
    ;(groupUser as any).belongsTo(models.group, { required: true, allowNull: false })
    ;(groupUser as any).belongsTo(models.user, { required: true, allowNull: false })
  }

  return groupUser
}
