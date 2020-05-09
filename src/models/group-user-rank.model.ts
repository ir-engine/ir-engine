import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const groupUserRank = sequelizeClient.define('group_user_rank', {
    rank: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    },
    timestamps: false
  });

  (groupUserRank as any).associate = (models: any): any => {
    (groupUserRank as any).belongsTo(models.group);
    (groupUserRank as any).belongsToMany(models.user, { through: models.group_user, foreignKey: 'rank' })
  }

  return groupUserRank
}
