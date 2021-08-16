/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { HookReturn } from 'sequelize/types/lib/hooks'

// const thefeeds = '';
// // conts Feeds = '';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const TheFeeds = sequelizeClient.define(
    'thefeeds',
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
      // videoUrl: {
      //   type: DataTypes.TEXT,
      //   allowNull: false
      // },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
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
  ;(TheFeeds as any).associate = (models: any): void => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    // (Feeds as any).belongsTo(models.creator, { foreignKey: 'creatorId', allowNull: false });
    ;(TheFeeds as any).belongsTo(models.static_resource, { as: 'video', required: true, constraints: false })
    //TODO look up constraints - make this fields as keys
    // (TheFeeds as any).belongsTo(models.static_resource, { as: 'video',  required: true, constraints: false });
    // (TheFeeds as any).hasMany(models.thefeeds);
  }

  return TheFeeds
}
