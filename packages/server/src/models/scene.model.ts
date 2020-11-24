import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';
import generateShortId from '../util/generate-short-id';

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const scene = sequelizeClient.define('scene', {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false
    },
    sid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      defaultValue: (): string => generateShortId(8)
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
    }
  }, {
    hooks: {
      beforeValidate (scene: any): void {
        if (scene.name) {
          scene.slug = (scene.name as string).split(' ').filter(character => character.length).join('-').toLowerCase();
        }
      },
      beforeCount (options: any): void {
        options.raw = true;
      }
    }
  });

  (scene as any).associate = (models: any): void => {
    (scene as any).belongsTo(models.user, { foreignKey: 'ownerUserId' });
    (scene as any).hasOne(models.project, { foreignKey: 'sceneId' });
    (scene as any).belongsTo(models.scene, { foreignKey: 'parentSceneId' });
    (scene as any).belongsTo(models.scene_listing, { foreignKey: 'parentSceneListingId' });
    (scene as any).belongsTo(models.owned_file, { foreignKey: 'modelOwnedFileId', allowNull: false });
    (scene as any).belongsTo(models.owned_file, { foreignKey: 'screenshotOwnedFileId', allowNull: false });
    // (scene as any).belongsTo(models.collection, { foreignKey: 'collectionId' });
  };

  return scene;
};
