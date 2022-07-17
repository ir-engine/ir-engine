import { DataTypes, Model, Sequelize } from 'sequelize'

import { LocationAuthorizedUserInterface } from '@xrengine/common/src/dbmodels/LocationAuthorizedUser'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const locationAuthorizedUser = sequelizeClient.define<Model<LocationAuthorizedUserInterface>>(
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
      required: true,
      foreignKey: { allowNull: true },
      onDelete: 'cascade'
    })
    ;(locationAuthorizedUser as any).belongsTo(models.user, {
      required: true,
      foreignKey: { allowNull: true },
      onDelete: 'cascade'
    })
  }
  return locationAuthorizedUser
}
