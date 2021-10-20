// A place in physical or virtual space, with many copies (instances)
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const location = sequelizeClient.define(
    'location',
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
      sceneId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      slugifiedName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      isLobby: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      maxUsersPerInstance: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 50
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

  ;(location as any).associate = (models: any): void => {
    ;(location as any).belongsToMany(models.user, { through: 'location_admin' })
    ;(location as any).hasMany(models.bot, { foreignKey: 'locationId' })
  }

  return location
}
