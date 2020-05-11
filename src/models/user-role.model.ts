import { Sequelize } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRole = sequelizeClient.define('user_role', {
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    },
    timestamps: false
  });

  (userRole as any).associate = (models: any) => {
    (userRole as any).hasMany(models.access_control, { foreignKey: 'userRole' });
    (userRole as any).hasMany(models.user, { foreignKey: 'userRole', primaryKey: true, unique: true })
  }

  return userRole
}
