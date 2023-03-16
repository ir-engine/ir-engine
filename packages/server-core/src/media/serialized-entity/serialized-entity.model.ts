import { DataTypes, Model, Sequelize } from 'sequelize'

import { SerializedEntityInterface } from '@etherealengine/common/src/dbmodels/SerializedEntity'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const serializedEntity = sequelizeClient.define<Model<SerializedEntityInterface>>(
    'serialized-entity',
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

  ;(serializedEntity as any).associate = (models: any): void => {
    ;(serializedEntity as any).belongsTo(models.static_resource, {
      foreignKey: 'staticResourceId',
      required: true
    })
    ;(serializedEntity as any).belongsTo(models.image, {
      foreignKey: 'thumbnailId',
      as: 'thumbnail',
      required: false
    })
  }

  return serializedEntity
}
