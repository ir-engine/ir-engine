import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const accessControl = sequelizeClient.define('access_control', {
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

  (accessControl as any).associate = (models: any) => {
    (accessControl as any).belongsTo(models.role, { through: 'role_access_control' });
    (accessControl as any).hasOne(models.resource_type);
    (accessControl as any).hasOne(models.access_control_scope, { as: 'list' });
    (accessControl as any).hasOne(models.access_control_scope, { as: 'create' });
    (accessControl as any).hasOne(models.access_control_scope, { as: 'read' });
    (accessControl as any).hasOne(models.access_control_scope, { as: 'update' });
    (accessControl as any).hasOne(models.access_control_scope, { as: 'delete' })
  }
  return accessControl
}
