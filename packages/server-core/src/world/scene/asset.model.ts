import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'
import generateShortId from '../../util/generate-short-id'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const asset = sequelizeClient.define(
    'asset',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
        allowNull: false
      },
      asset_sid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        defaultValue: (): string => generateShortId(8)
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        values: ['image', 'video', 'model', 'audio']
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

  ;(asset as any).associate = (models: any): void => {
    ;(asset as any).belongsToMany(models.project, { through: models.asset, foreignKey: 'assetId' })
    ;(asset as any).belongsTo(models.user, { foreignKey: 'ownerUserId' })
    ;(asset as any).belongsTo(models.owned_file, { foreignKey: 'asset_owned_file_id' })
    ;(asset as any).belongsTo(models.owned_file, { foreignKey: 'thumbnailOwnedFileId' })
  }

  return asset
}
