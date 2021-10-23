/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { HookReturn } from 'sequelize/types/lib/hooks'

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Feed = sequelizeClient.define(
    'feed',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      viewsCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      featuredByAdmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true
        }
      }
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(Feed as any).associate = (models: any): void => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    ;(Feed as any).belongsTo(models.creator, { foreignKey: 'creatorId', allowNull: false })
    //TODO look up constraints - make this fields as keys
    ;(Feed as any).belongsTo(models.static_resource, { as: 'video', required: true, constraints: false })
    ;(Feed as any).belongsTo(models.static_resource, { as: 'preview', required: true, constraints: false })
    ;(Feed as any).hasMany(models.feed_fires)
    ;(Feed as any).hasMany(models.feed_likes)
    ;(Feed as any).hasMany(models.feed_bookmark)
    ;(Feed as any).hasMany(models.comments)
  }

  return Feed
}
