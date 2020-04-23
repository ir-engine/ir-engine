import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

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
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    asset_owned_file_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    thumbnail_owned_file_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (asset as any).associate = (models: any) => {
    (asset as any).belongsToMany(models.project, { through: models.project_assets, foreignKey: 'asset_id' });
    (asset as any).belongsTo(models.user, { foreignKey: 'account_id', targetKey: 'userId' });
    (asset as any).belongsTo(models.owned_files, { foreignKey: 'asset_owned_file_id', targetKey: 'owned_file_id' });
    (asset as any).belongsTo(models.owned_files, { foreignKey: 'thumbnail_owned_file_id', targetKey: 'owned_file_id' })
  }

  return asset
}
