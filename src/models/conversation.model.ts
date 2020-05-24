import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const conversation = sequelizeClient.define('conversation', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user1: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    groupId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    partyId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    recipientType: {
      type: DataTypes.STRING,
      // values: ['user', 'group', 'party'],
      defaultValue: 'user'
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  (conversation as any).associate = (models: any) => {
    (conversation as any).hasMany(models.messages)
    // (conversation as any).belongsTo(models.user)
  }

  return conversation
}
