import { Sequelize } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const groupUser = sequelizeClient.define('group_user', {}, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (groupUser as any).associate = function (models: any) {
    (groupUser as any).belongsTo(models.user, { foreignKey: 'userId' });
    (groupUser as any).belongsTo(models.group, { foreignKey: { name: 'groupId', allowNull: false } });
    (groupUser as any).belongsTo(models.group_user_rank, { foreignKey: 'rank', required: true })
  }

  return groupUser
}
