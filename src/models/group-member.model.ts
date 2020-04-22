// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const groupMember = sequelizeClient.define('group_member', {
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

  // eslint-disable-next-line no-unused-vars
  (groupMember as any).associate = function (models: any) {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    ;(groupMember as any).hasOne(models.group, { foreignKey: 'id' })
    ;(groupMember as any).hasOne(models.user, { foreignKey: 'userId' })
  }

  return groupMember
}
