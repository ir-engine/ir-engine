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
  const Notification = sequelizeClient.define(
    'notifications',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        values: ['feed', 'feed-fire', 'feed-bookmark', 'comment', 'comment-fire', 'follow', 'unfollow']
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
  ;(Notification as any).associate = function (models: any): void {
    // (Notification as any).belongsTo(models.creator, { foreignKey: 'creatorAuthorId', allowNull: false });
    // (Notification as any).belongsTo(models.creator, { foreignKey: 'creatorViewerId', allowNull: false });
    // (Notification as any).belongsTo(models.feed, { foreignKey: 'feedId', allowNull: true });
    // (Notification as any).belongsTo(models.comments, { foreignKey: 'commentId', allowNull: true });
  }

  return Notification
}
