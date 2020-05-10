import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const accessControl = sequelizeClient.define('access_control', {
    userRole: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: false
    },
    resourceType: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    },
    timestamps: false
  });

  (accessControl as any).associate = (models: any) => {
    (accessControl as any).hasOne(models.user_role, { foreignKey: 'userRole', required: true });
    (accessControl as any).hasOne(models.resource_type, { foreignKey: 'resourceType', required: true });
    (accessControl as any).hasOne(models.access_control_scope, { as: 'list', foreignKey: 'list', required: true });
    (accessControl as any).hasOne(models.access_control_scope, { as: 'create', foreignKey: 'create', required: true });
    (accessControl as any).hasOne(models.access_control_scope, { as: 'read', foreignKey: 'read', required: true });
    (accessControl as any).hasOne(models.access_control_scope, { as: 'update', foreignKey: 'update', required: true });
    (accessControl as any).hasOne(models.access_control_scope, { as: 'delete', foreignKey: 'delete', required: true })
  }
  return accessControl
}
