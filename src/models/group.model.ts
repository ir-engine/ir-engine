import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const Group = sequelizeClient.define('group', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    isPublic: {
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
        fields: ['id', 'ownerId']
      },
      {
        fields: ['isPublic']
      }
    ]
  });

  // eslint-disable-next-line no-unused-vars
  (Group as any).associate = (models: any) => {
    (Group as any).belongsTo(models.user, { foreignKey: 'ownerId' });
    (Group as any).belongsToMany(models.user, { through: models.group_member, otherKey: 'userId' })
  }

  return Group
}
