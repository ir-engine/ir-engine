import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const groupUser = sequelizeClient.define('group_user', {
    isOwner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isInviteAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (groupUser as any).associate = (models: any) => {
    (groupUser as any).belongsTo(models.group, { foreignKey: 'groupId' });
    (groupUser as any).belongsTo(models.user, { foreignKey: 'userId' })
  }

  return groupUser
}
