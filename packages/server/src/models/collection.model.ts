import { Sequelize, DataTypes } from 'sequelize';
import { Application } from '../declarations';
import generateShortId from '../util/generate-short-id';

const COLLECTION_API_ENDPOINT = `https://localhost:3030/collection`;

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient');
  const collection = sequelizeClient.define('collection', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    sid: {
      type: DataTypes.STRING,
      defaultValue: (): string => generateShortId(8),
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
    version: DataTypes.INTEGER,
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      allowNull: true,
      get (this: any): string | JSON {
        const metaData = this.getDataValue('metadata');
        if (!metaData || metaData === {}) {
          return '';
        } else {
          return metaData;
        }
      }
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    url: {
      type: DataTypes.VIRTUAL,
      get (this: any): string {
        return `${COLLECTION_API_ENDPOINT}/${(this.id as string)}`;
      },
      set (): void {
        throw new Error('Do not try to set the `url` value!');
      }
    }
  }, {
    hooks: {
      beforeCount (options: any): void {
        options.raw = true;
      }
    }
  });

  (collection as any).associate = (models: any): void => {
    (collection as any).belongsTo(models.collection_type, { foreignKey: 'type', required: true });
    (collection as any).hasOne(models.attribution);
    (collection as any).belongsTo(models.static_resource, { as: 'thumbnail_owned_file' });
    (collection as any).hasMany(models.entity, { foreignKey: 'collectionId', required: false, constraints: false, onDelete: 'cascade' });
    (collection as any).hasMany(models.tag);
    (collection as any).belongsTo(models.user); // Reticulum foreignKey: 'creatorUserId'
    (collection as any).belongsTo(models.location);
    (collection as any).belongsToMany(models.tag, { through: 'collection_tag' });
    // (collection as any).belongsTo(models.collection)

    // thumbnail   (project as any).belongsTo(models.owned_file, { foreignKey: 'thumbnailOwnedFileId' })
    // parent collection   (project as any).belongsTo(models.scene, { foreignKey: 'parentSceneId' });
    // hasMany static resources (project as any).belongsToMany(models.asset, { foreignKey: 'projectId' });
    // ??? listing ? (project as any).belongsTo(models.scene_listing, { foreignKey: 'parentSceneListingId' })

    // scene and project can be same   (project as any).belongsTo(models.scene, { foreignKey: 'sceneId' });
    // associated model? remove? (scene as any).belongsTo(models.owned_file, { foreignKey: 'modelOwnedFileId', allowNull: false });
    // screenshot (scene as any).belongsTo(models.owned_file, { foreignKey: 'screenshotOwnedFileId', allowNull: false });
  };

  return collection;
};
