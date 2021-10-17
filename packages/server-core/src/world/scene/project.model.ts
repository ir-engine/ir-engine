import { TooManyRequests } from '@feathersjs/errors'
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'
import generateShortId from '../../util/generate-short-id'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const project = sequelizeClient.define(
    'project',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      metadata: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      root: {
        type: DataTypes.STRING,
        allowNull: true
      },
      sidsid: {
        type: DataTypes.STRING,
        defaultValue: (): string => generateShortId(8),
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
      },
      version: {
        type: DataTypes.STRING,
        allowNull: false
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

  ;(project as any).associate = (models: any): void => {
    ;(project as any).belongsTo(models.location, { foreignKey: 'locationId' })
    //    (project as any).belongsTo(models.user, { foreignKey: 'user_id' });
    ;(project as any).belongsToMany(models.asset, { through: models.project_asset, foreignKey: 'user_id' })
    ;(project as any).belongsTo(models.owned_file, { foreignKey: 'thumbnailOwnedFileId' })
  }

  return project
}
