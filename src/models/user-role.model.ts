import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRole = sequelizeClient.define('user_role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    },
    timestamps: false
  });

  (userRole as any).associate = (models: any) => {
    // (userRole as any).hasMany(models.access_control);
    (userRole as any).hasMany(models.user, { foreignKey: 'role' })
  }

  return userRole
}
