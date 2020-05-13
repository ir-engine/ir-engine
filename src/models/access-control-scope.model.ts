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
      },
      beforeUpdate (instance: any, options: any) {
        throw new Error("Can't update a scope!")
      }
    },
    timestamps: false
  });

  (accessControlScope as any).associate = (models: any) => {
    (accessControlScope as any).hasMany(models.access_control, { foreignKey: 'list' });
    (accessControlScope as any).hasMany(models.access_control, { foreignKey: 'create' });
    (accessControlScope as any).hasMany(models.access_control, { foreignKey: 'read' });
    (accessControlScope as any).hasMany(models.access_control, { foreignKey: 'update' });
    (accessControlScope as any).hasMany(models.access_control, { foreignKey: 'delete' })
  }

  return accessControlScope
}
