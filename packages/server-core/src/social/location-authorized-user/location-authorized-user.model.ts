import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'
// import Location from './location.model'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const locationAuthorizedUser = sequelizeClient.define(
    'location_authorized_user',
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

  ;(locationAuthorizedUser as any).associate = (models: any): void => {
    ;(locationAuthorizedUser as any).belongsTo(models.location, {
      foreignKey: { field: 'locationId', allowNull: false },
      onDelete: 'CASCADE'
    })
    ;(locationAuthorizedUser as any).belongsTo(models.user, {
      foreignKey: { field: 'userId', allowNull: false },
      onDelete: 'CASCADE'
    })
  }
  return locationAuthorizedUser
}
