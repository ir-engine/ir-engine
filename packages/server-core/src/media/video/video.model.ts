import { DataTypes, Model, Sequelize } from 'sequelize'

import { VideoInterface } from '@etherealengine/common/src/dbmodels/Video'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const video = sequelizeClient.define<Model<VideoInterface>>(
    'video',
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
      height: {
        type: DataTypes.INTEGER
      },
      width: {
        type: DataTypes.INTEGER
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

  ;(video as any).associate = (models: any): void => {
    ;(video as any).belongsTo(models.static_resource, {
      foreignKey: 'staticResourceId',
      as: 'staticResource',
      required: false
    })
    ;(video as any).belongsTo(models.image, {
      foreignKey: 'thumbnail',
      required: false
    })
  }

  return video
}
