import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'
import generateShortId from '../util/generate-short-id'
import config from 'config'

const COLLECTION_API_ENDPOINT = `https://${(config.get('host') as string)}:${(config.get('port') as string)}/collection`
export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const project = sequelizeClient.define('project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
      allowNull: false
    },
    sid: {
      type: DataTypes.UUID,
      unique: true,
      defaultValue: () => generateShortId(8),
      allowNull: false
    },
    url: {
      type: DataTypes.VIRTUAL,
      get (this: any) {
        if (!this.collectionId) {
          return ''
        } else {
          return `${COLLECTION_API_ENDPOINT}/${(this.collectionId as string)}`
        }
      },
      set () {
        throw new Error('Do not try to set the `url` value!')
      }
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
    (project as any).belongsTo(models.user, { foreignKey: 'creatorUserId' });
    (project as any).belongsToMany(models.asset, { foreignKey: 'projectId', through: models.project_asset });
    (project as any).belongsTo(models.collection, { foreignKey: 'collectionId', allowNull: false });
    (project as any).belongsTo(models.owned_file, { foreignKey: 'thumbnailOwnedFileId' });
    (project as any).belongsTo(models.scene, { foreignKey: 'sceneId' });
    (project as any).belongsTo(models.scene, { foreignKey: 'parentSceneId' });
    (project as any).belongsTo(models.scene_listing, { foreignKey: 'parentSceneListingId' })
  }

  return project
}
