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
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (conversation as any).associate = (models: any) => {
    // Define associations here
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
    (conversation as any).hasMany(models.message);
    (conversation as any).belongsTo(models.user, { as: 'firstuser', constraint: false });
    (conversation as any).belongsTo(models.user, { as: 'seconduser', constraint: false });
    (conversation as any).belongsTo(models.group, { foreignKey: 'groupId', constraint: false });
    (conversation as any).belongsTo(models.party, { foreignKey: 'partyId', constraint: false })
  }

  return conversation
}
