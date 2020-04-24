import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const role = sequelizeClient.define('role', {
    name: {
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
    }
  });

  (role as any).associate = (models: any) => {
    (role as any).belongsToMany(models.access_control, { through: 'role_access_control' });
    (role as any).hasMany(models.user)
  }

  return role
}
