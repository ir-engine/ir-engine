import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const groupUser = sequelizeClient.define('group_user', {
    groupId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isOwner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isMuted: {
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
    },
    indexes: [
      {
        unique: true,
        fields: ['groupId', 'userId']
      },
      {
        fields: ['userId']
      }
    ]
  });

  (groupUser as any).associate = (models: any) => {
    (groupUser as any).hasOne(models.group, { foreignKey: 'id' });
    (groupUser as any).hasOne(models.user, { foreignKey: 'userId' })
  }

  return groupUser
}
