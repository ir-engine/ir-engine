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
    (accessControl as any).belongsTo(models.user_role, { foreignKey: 'userRole', required: true, primaryKey: true });
    (accessControl as any).belongsTo(models.resource_type, { foreignKey: 'resourceType', required: true, primaryKey: true });
    (accessControl as any).belongsTo(models.access_control_scope, { as: 'list', foreignKey: 'listScope', constraints: false });
    (accessControl as any).belongsTo(models.access_control_scope, { as: 'create', foreignKey: 'createScope', constraints: false });
    (accessControl as any).belongsTo(models.access_control_scope, { as: 'read', foreignKey: 'readScope', constraints: false });
    (accessControl as any).belongsTo(models.access_control_scope, { as: 'update', foreignKey: 'updateScope', constraints: false });
    (accessControl as any).belongsTo(models.access_control_scope, { as: 'delete', foreignKey: 'deleteScope', constraints: false })
  }
  return accessControl
}
