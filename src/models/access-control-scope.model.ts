import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const accessControlScope = sequelizeClient.define('access_control_scope', {
    scope: {
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
    },
    timestamps: false
  });

  (accessControlScope as any).associate = (models: any): any => {
    (accessControlScope as any).hasMany(models.access_control, { as: 'accessControl', foreignKey: 'accessControlScope' })
  }

  return accessControlScope
}
