import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const resourceChild = sequelizeClient.define('resource_child', {
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (resourceChild as any).associate = function (models: any) {
    (resourceChild as any).belongsTo(models.resource, { foreignKey: 'resourceParent' });
    (resourceChild as any).belongsTo(models.resource, { foreignKey: 'resourceChild' })
  }

  return resourceChild
}
