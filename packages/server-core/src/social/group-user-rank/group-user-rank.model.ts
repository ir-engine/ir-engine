import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { GroupUserRankInterface } from '@xrengine/common/src/dbmodels/GroupUserRank'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const groupUserRank = sequelizeClient.define<Model<GroupUserRankInterface>>(
    'group_user_rank',
    {
      rank: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      },
      timestamps: false
    }
  )

  ;(groupUserRank as any).associate = (models: any): any => {}

  return groupUserRank
}
