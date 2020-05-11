import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const project = sequelizeClient.define('project', {
    project_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false
    },
    project_sid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (project as any).associate = (models: any) => {
    (project as any).belongsTo(models.user, { foreignKey: 'created_by_account_id' });
    (project as any).belongsToMany(models.asset, { foreignKey: 'project_id', through: models.project_asset });
    (project as any).belongsTo(models.owned_file, { foreignKey: 'project_owned_file_id', targetKey: 'owned_file_id', as: 'project_owned_file' });
    (project as any).belongsTo(models.owned_file, { foreignKey: 'thumbnail_owned_file_id', targetKey: 'owned_file_id', as: 'thumbnail_owned_file' });
    (project as any).belongsTo(models.scene, { foreignKey: 'scene_id' });
    (project as any).belongsTo(models.scene, { foreignKey: 'parent_scene_id', targetKey: 'scene_id', as: 'parent_scene' });
    (project as any).belongsTo(models.scene_listing, { foreignKey: 'parent_scene_listing_id', targetKey: 'scene_listing_id' })
  }

  return project
}
