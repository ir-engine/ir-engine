/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { HookReturn } from 'sequelize/types/lib/hooks'

// const thefeeds = '';
// conts TheFeeds = '';

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const thefeedsFires = sequelizeClient.define(
    'thefeeds_fires',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
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
  ;(thefeedsFires as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    ;(thefeedsFires as any).belongsTo(models.creator, { foreignKey: 'creatorId', allowNull: false })
    ;(thefeedsFires as any).belongsTo(models.thefeeds, { foreignKey: 'thefeedsId', allowNull: false })
  }

  return thefeedsFires
}
