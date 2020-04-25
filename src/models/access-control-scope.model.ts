import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const accessControlScope = sequelizeClient.define('access_control_scope', {
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

  (accessControlScope as any).associate = (models: any): any => {
    (accessControlScope as any).belongsToMany(models.access_control)
  }

  return accessControlScope
}
