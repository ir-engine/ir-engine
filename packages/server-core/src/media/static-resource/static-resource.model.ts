import { DataTypes, Model, Sequelize } from 'sequelize'

import { StaticResourceInterface } from '@etherealengine/common/src/dbmodels/StaticResource'

import { Application } from '../../../declarations'
import generateShortId from '../../util/generate-short-id'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const staticResource = sequelizeClient.define<Model<StaticResourceInterface>>(
    'static_resource',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      sid: {
        type: DataTypes.STRING,
        defaultValue: (): string => generateShortId(8),
        allowNull: false
      },
      hash: {
        type: DataTypes.STRING,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true
      },
      key: {
        type: DataTypes.STRING
      },
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      },
      project: {
        type: DataTypes.STRING,
        allowNull: true
      },
      driver: {
        type: DataTypes.STRING
      },
      licensing: {
        type: DataTypes.STRING
      },
      attribution: {
        type: DataTypes.STRING
      },
      tags: {
        type: DataTypes.JSON
      },
      LOD0_url: {
        type: DataTypes.STRING
      },
      LOD0_metadata: {
        type: DataTypes.JSON
      },
      LOD1_url: {
        type: DataTypes.STRING
      },
      LOD1_metadata: {
        type: DataTypes.JSON
      },
      LOD2_url: {
        type: DataTypes.STRING
      },
      LOD2_metadata: {
        type: DataTypes.JSON
      },
      LOD3_url: {
        type: DataTypes.STRING
      },
      LOD3_metadata: {
        type: DataTypes.JSON
      },
      LOD4_url: {
        type: DataTypes.STRING
      },
      LOD4_metadata: {
        type: DataTypes.JSON
      },
      LOD5_url: {
        type: DataTypes.STRING
      },
      LOD5_metadata: {
        type: DataTypes.JSON
      },
      LOD6_url: {
        type: DataTypes.STRING
      },
      LOD6_metadata: {
        type: DataTypes.JSON
      },
      LOD7_url: {
        type: DataTypes.STRING
      },
      LOD7_metadata: {
        type: DataTypes.JSON
      },
      LOD8_url: {
        type: DataTypes.STRING
      },
      LOD8_metadata: {
        type: DataTypes.JSON
      },
      LOD9_url: {
        type: DataTypes.STRING
      },
      LOD9_metadata: {
        type: DataTypes.JSON
      },
      LOD10_url: {
        type: DataTypes.STRING
      },
      LOD10_metadata: {
        type: DataTypes.JSON
      },
      LOD11_url: {
        type: DataTypes.STRING
      },
      LOD11_metadata: {
        type: DataTypes.JSON
      },
      LOD12_url: {
        type: DataTypes.STRING
      },
      LOD12_metadata: {
        type: DataTypes.JSON
      },
      LOD13_url: {
        type: DataTypes.STRING
      },
      LOD13_metadata: {
        type: DataTypes.JSON
      },
      LOD14_url: {
        type: DataTypes.STRING
      },
      LOD14_metadata: {
        type: DataTypes.JSON
      },
      LOD15_url: {
        type: DataTypes.STRING
      },
      LOD15_metadata: {
        type: DataTypes.JSON
      },
      LOD16_url: {
        type: DataTypes.STRING
      },
      LOD16_metadata: {
        type: DataTypes.JSON
      },
      LOD17_url: {
        type: DataTypes.STRING
      },
      LOD17_metadata: {
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

  ;(staticResource as any).associate = (models: any): void => {
    ;(staticResource as any).belongsTo(models.static_resource_type, {
      foreignKey: 'staticResourceType',
      required: true
    })
    ;(staticResource as any).belongsTo(models.user)
    ;(staticResource as any).hasMany(models.static_resource, {
      as: 'parent',
      foreignKey: 'parentResourceId',
      allowNull: true
    })
  }

  return staticResource
}
