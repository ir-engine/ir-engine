import { DataTypes, Model, Sequelize } from 'sequelize'

import { CubemapInterface } from '@etherealengine/common/src/dbmodels/Cubemap'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const cubemap = sequelizeClient.define<Model<CubemapInterface>>(
    'cubemap',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING
      },
      tags: {
        type: DataTypes.JSON
      },
      type: {
        type: DataTypes.STRING
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

  ;(cubemap as any).associate = (models: any): void => {
    ;(cubemap as any).belongsTo(models.static_resource, {
      foreignKey: 'staticResourceId',
      required: true
    })
    ;(cubemap as any).belongsTo(models.image, {
      foreignKey: 'thumbnailId',
      as: 'thumbnail',
      required: false
    })
  }

  return cubemap
}
