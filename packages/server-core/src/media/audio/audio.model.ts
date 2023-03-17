import { DataTypes, Model, Sequelize } from 'sequelize'

import { AudioInterface } from '@etherealengine/common/src/dbmodels/Audio'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const audio = sequelizeClient.define<Model<AudioInterface>>(
    'audio',
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

  ;(audio as any).associate = (models: any): void => {
    ;(audio as any).belongsTo(models.static_resource, {
      foreignKey: 'mp3StaticResourceId',
      as: 'mp3StaticResource',
      required: false
    })
    ;(audio as any).belongsTo(models.static_resource, {
      foreignKey: 'mpegStaticResourceId',
      as: 'mpegStaticResource',
      required: false
    })
    ;(audio as any).belongsTo(models.static_resource, {
      foreignKey: 'oggStaticResourceId',
      as: 'oggStaticResource',
      required: false
    })
    ;(audio as any).belongsTo(models.image, {
      foreignKey: 'thumbnail',
      required: false
    })
  }

  return audio
}
