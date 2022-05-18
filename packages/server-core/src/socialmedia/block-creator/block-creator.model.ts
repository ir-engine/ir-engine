import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { HookReturn } from 'sequelize/types/lib/hooks'

export default function (app: Application): typeof Model {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const blockCreator = sequelizeClient.define(
    'block_creator',
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
  ;(blockCreator as any).associate = function (models: any): void {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    ;(blockCreator as any).belongsTo(models.creator, { foreignKey: 'creatorId', allowNull: false })
    ;(blockCreator as any).belongsTo(models.creator, { foreignKey: 'blockedId', allowNull: false })
  }

  return blockCreator
}
