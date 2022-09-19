// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { DataTypes, Model, Sequelize } from 'sequelize'
import { HookReturn } from 'sequelize/types/hooks'

import { LocationBanInterface } from '@xrengine/common/src/dbmodels/LocationBan'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const locationBan = sequelizeClient.define<Model<LocationBanInterface>>(
    'location_ban',
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
        beforeCount(options: any): HookReturn {
          options.raw = true
        }
      }
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(locationBan as any).associate = function (models: any): void {
    ;(locationBan as any).belongsTo(models.location)
    ;(locationBan as any).belongsTo(models.user)
  }

  return locationBan
}
