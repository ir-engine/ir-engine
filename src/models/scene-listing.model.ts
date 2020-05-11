import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const sceneListing = sequelizeClient.define('scene_listing', {
    scene_listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    scene_listing_sid: {
      type: DataTypes.STRING,
      allowNull: true
    },
    scene_id: {
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
    attributions: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // TODO: Think about it, in reticulum it is jsonB
    tags: {
      type: DataTypes.STRING,
      allowNull: false
    },
    model_owned_file_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    scene_owned_file_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    screenshot_owned_file_id: {
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
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (sceneListing as any).associate = (models: any) => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    // (sceneListing as any).belongsTo(models.scene, { foreignKey: 'scene_id', targetKey: 'scene_id' });
    (sceneListing as any).belongsTo(models.owned_file, { foreignKey: 'model_owned_file_id', targetKey: 'owned_file_id', as: 'model_owned_file' });
    (sceneListing as any).belongsTo(models.owned_file, { foreignKey: 'screenshot_owned_file_id', targetKey: 'owned_file_id', as: 'screenshot_owned_file' });
    (sceneListing as any).belongsTo(models.owned_file, { foreignKey: 'scene_owned_file_id', targetKey: 'owned_file_id', as: 'scene_owned_file' })
  }

  return sceneListing
}
