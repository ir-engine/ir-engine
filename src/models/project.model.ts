// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const project = sequelizeClient.define('project', {
    project_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    project_sid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    created_by_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    project_owned_file_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    thumbnail_owned_file_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    scene_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parent_scene_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    parent_scene_listing_id: {
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

  // eslint-disable-next-line no-unused-vars
  (project as any).associate = (models: any) => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/

    (project as any).belongsTo(models.user, { foreignKey: 'created_by_account_id', targetKey: 'userId' });
    (project as any).belongsToMany(models.asset, { foreignKey: 'project_id', through: models.project_assets });

    (project as any).belongsTo(models.owned_files, { foreignKey: 'project_owned_file', targetKey: 'owned_file_id' });
    (project as any).belongsTo(models.owned_files, { foreignKey: 'thumbnail_owned_file', targetKey: 'owned_file_id' });
    (project as any).belongsTo(models.scene, { foreignKey: 'scene_id', targetKey: 'scene_id' });
    (project as any).belongsTo(models.scene, { foreignKey: 'parent_scene_id', targetKey: 'scene_id' });
    (project as any).belongsTo(models.scene_listings, { foreignKey: 'parent_scene_listing_id', targetKey: 'scene_listing_id' });
  }

  return project
}
