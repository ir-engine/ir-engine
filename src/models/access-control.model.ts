import { Sequelize } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const accessControl = sequelizeClient.define('access_control', {
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    },
    timestamps: false
  });

  (accessControl as any).associate = (models: any) => {
    (accessControl as any).belongsTo(models.user_role, { foreignKey: 'userRole', required: true, primaryKey: true, allowNull: false });
    (accessControl as any).belongsTo(models.resource_type, { foreignKey: 'resourceType', required: true, primaryKey: true, allowNull: false });
    (accessControl as any).belongsTo(models.access_control_scope, { foreignKey: 'list', required: true });
    (accessControl as any).belongsTo(models.access_control_scope, { foreignKey: 'create', required: true });
    (accessControl as any).belongsTo(models.access_control_scope, { foreignKey: 'read', required: true });
    (accessControl as any).belongsTo(models.access_control_scope, { foreignKey: 'update', required: true });
    (accessControl as any).belongsTo(models.access_control_scope, { foreignKey: 'delete', required: true })
  }
  return accessControl
}
