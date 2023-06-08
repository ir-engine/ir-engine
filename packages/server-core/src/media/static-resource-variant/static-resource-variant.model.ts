import { DataTypes, Model, Sequelize } from 'sequelize'

import { StaticResourceVariantInterface } from '@etherealengine/common/src/dbmodels/StaticResourceVariant'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const staticResourceVariant = sequelizeClient.define<Model<StaticResourceVariantInterface>>(
    'static_resource_variant',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      url: {
        type: DataTypes.STRING
      },
      metadata: {
        type: DataTypes.JSON
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      },
      timestamps: false
    }
  )

  ;(staticResourceVariant as any).associate = (models: any): void => {
    ;(staticResourceVariant as any).belongsTo(models.static_resource, {
      foreignKey: 'staticResourceId',
      required: true
    })
  }

  return staticResourceVariant
}
