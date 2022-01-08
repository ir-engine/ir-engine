// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { DataTypes, Model, Sequelize } from 'sequelize'
import { HookReturn } from 'sequelize/types/lib/hooks'

import { Application } from '../../../declarations'

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const locationAdmin = sequelizeClient.define(
    'location_admin',
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
  ;(locationAdmin as any).associate = function (models: any): void {
    ;(locationAdmin as any).belongsTo(models.location, { required: true, allowNull: false })
    ;(locationAdmin as any).belongsTo(models.user, { required: true, allowNull: false })
  }

  return locationAdmin
}
