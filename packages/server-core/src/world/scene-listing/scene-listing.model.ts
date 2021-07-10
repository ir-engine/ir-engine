import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'
import generateShortId from '../../util/generate-short-id'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const sceneListing = sequelizeClient.define(
    'scene_listing',
    {
      scene_listing_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      scene_listing_sid: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        defaultValue: (): string => generateShortId(8)
      },
      sceneId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      // TODO: Think about it, in reticulum it is jsonB
      tags: {
        type: DataTypes.STRING,
        allowNull: false
      },
      modelOwnedFileId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      sceneOwnedFileId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      screenshotOwnedFileId: {
        type: DataTypes.UUID,
        allowNull: false
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
        values: ['active', 'delisted']
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

  ;(sceneListing as any).associate = (models: any): void => {
    ;(sceneListing as any).belongsTo(models.owned_file, { foreignKey: 'modelOwnedFileId' })
    ;(sceneListing as any).belongsTo(models.owned_file, { foreignKey: 'screenshotOwnedFileId' })
    ;(sceneListing as any).belongsTo(models.owned_file, { foreignKey: 'sceneOwnedFileId' })
  }

  return sceneListing
}
