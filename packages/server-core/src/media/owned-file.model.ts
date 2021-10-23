import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ownedFile = sequelizeClient.define(
    'owned_file',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      key: {
        type: DataTypes.STRING,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      content_type: {
        type: DataTypes.STRING,
        allowNull: true
      },
      content_length: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        values: ['active', 'inactive', 'removed']
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

  ;(ownedFile as any).associate = (models: any): void => {
    ;(ownedFile as any).belongsTo(models.user, { foreignKey: 'ownerUserId', allowNull: false })
  }

  return ownedFile
}
