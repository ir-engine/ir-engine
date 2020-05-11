import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const scene = sequelizeClient.define('scene', {
    scene_id: {
      primaryKey: true,
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false
    },
    scene_sid: {
      type: DataTypes.STRING,
      allowNull: true
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
    model_owned_file_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    screenshot_owned_file_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    },
    attribution: {
      type: DataTypes.STRING,
      allowNull: true
    },
    allow_remixing: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    allow_promotion: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    scene_owned_file_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    // TODO: In reticulum, it is json type, but sql does not support json so need to think about it!
    attributions: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    imported_from_host: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imported_from_port: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    imported_from_sid: {
      type: DataTypes.STRING,
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
      beforeValidate(scene: any) {
        if (scene.name) {
          scene.slug = (scene.name as string).split(' ').filter(character => character.length).join('-').toLowerCase()
        }
      },
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (scene as any).associate = (models: any) => {
    (scene as any).belongsTo(models.user, { foreignKey: 'account_id' });
    (scene as any).hasOne(models.project, { foreignKey: 'scene_id' });
    (scene as any).belongsTo(models.scene, { foreignKey: 'parent_scene_id', targetKey: 'scene_id' });
    (scene as any).belongsTo(models.scene_listing, { foreignKey: 'parent_scene_listing_id', targetKey: 'scene_listing_id', allowNull: true });
    (scene as any).belongsTo(models.owned_file, { foreignKey: 'model_owned_file_id', targetKey: 'owned_file_id', as: 'model_owned_file' });
    (scene as any).belongsTo(models.owned_file, { foreignKey: 'screenshot_owned_file_id', targetKey: 'owned_file_id', as: 'screenshot_owned_file' });
    (scene as any).belongsTo(models.owned_file, { foreignKey: 'scene_owned_file_id', targetKey: 'owned_file_id', as: 'scene_owned_file' })
  }

  return scene
}
