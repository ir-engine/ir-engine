// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { DataTypes, Sequelize } from 'sequelize'
import { HookReturn } from 'sequelize/types/lib/hooks'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const locationType = sequelizeClient.define(
    'location_type',
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true
        },
        beforeUpdate(instance: any, options: any): void {
          throw new Error("Can't update a type!")
        }
      },
      timestamps: false
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(locationType as any).associate = (models: any): void => {
    ;(locationType as any).hasMany(models.location_settings, { foreignKey: 'locationType' })
  }

  return locationType
}
