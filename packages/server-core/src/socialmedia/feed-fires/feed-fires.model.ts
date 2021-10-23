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
  const feedFires = sequelizeClient.define(
    'feed_fires',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      }
    },
    {
      indexes: [
        {
          unique: true,
          fields: ['creatorId', 'feedId']
        }
      ],
      hooks: {
        beforeCount(options: any): HookReturn {
          options.raw = true
        }
      }
    }
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ;(feedFires as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    ;(feedFires as any).belongsTo(models.creator, { foreignKey: 'creatorId', allowNull: false })
    ;(feedFires as any).belongsTo(models.feed, { foreignKey: 'feedId', allowNull: false })
  }

  return feedFires
}
