import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'
import generateShortId from '../util/generate-short-id'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const asset = sequelizeClient.define('asset', {
    asset_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    asset_sid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: () => generateShortId(8)
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
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (asset as any).associate = (models: any) => {
    (asset as any).belongsToMany(models.project, { through: models.project_asset, foreignKey: 'asset_id' });
    (asset as any).belongsTo(models.user, { foreignKey: 'account_id' });
    (asset as any).belongsTo(models.owned_file, { foreignKey: 'asset_owned_file_id', targetKey: 'owned_file_id' });
    (asset as any).belongsTo(models.owned_file, { foreignKey: 'thumbnail_owned_file_id', targetKey: 'owned_file_id' })
  }

  return asset
}
