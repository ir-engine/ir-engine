import { DataTypes, Model, Sequelize } from 'sequelize'

import { MaterialInterface } from '@etherealengine/common/src/dbmodels/Material'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const material = sequelizeClient.define<Model<MaterialInterface>>(
    'material',
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

  ;(material as any).associate = (models: any): void => {
    ;(material as any).belongsTo(models.static_resource, {
      foreignKey: 'staticResourceId',
      required: true
    })
    ;(material as any).belongsTo(models.image, {
      foreignKey: 'thumbnailId',
      as: 'thumbnail',
      required: false
    })
  }

  return material
}
