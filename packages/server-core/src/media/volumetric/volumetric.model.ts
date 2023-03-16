import { DataTypes, Model, Sequelize } from 'sequelize'

import { VolumetricInterface } from '@etherealengine/common/src/dbmodels/Volumetric'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const volumetric = sequelizeClient.define<Model<VolumetricInterface>>(
    'volumetric',
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
      duration: {
        type: DataTypes.INTEGER
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

  ;(volumetric as any).associate = (models: any): void => {
    ;(volumetric as any).belongsTo(models.static_resource, {
      foreignKey: 'drcsStaticResourceId',
      as: 'drcsStaticResource',
      required: false
    })
    ;(volumetric as any).belongsTo(models.static_resource, {
      foreignKey: 'uvolStaticResourceId',
      as: 'uvolStaticResource',
      required: false
    })
    ;(volumetric as any).belongsTo(models.data, {
      foreignKey: 'manifestId',
      as: 'manifest',
      required: false
    })
    ;(volumetric as any).belongsTo(models.video, {
      foreignKey: 'videoId',
      as: 'video',
      required: false
    })
    ;(volumetric as any).belongsTo(models.image, {
      foreignKey: 'thumbnailId',
      as: 'thumbnail',
      required: false
    })
  }

  return volumetric
}
