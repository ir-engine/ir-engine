import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { StaticResourceTypeInterface } from '@xrengine/common/src/dbmodels/StaticResourceType'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const staticResourceType = sequelizeClient.define<Model<StaticResourceTypeInterface>>(
    'static_resource_type',
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
        beforeCount(options: any): void {
          options.raw = true
        },
        beforeUpdate(instance: any, options: any): void {
          throw new Error("Can't update a type!")
        }
      },
      timestamps: false
    }
  )

  ;(staticResourceType as any).associate = (models: any): void => {
    ;(staticResourceType as any).hasMany(models.static_resource, { foreignKey: 'staticResourceType' })
  }

  return staticResourceType
}
