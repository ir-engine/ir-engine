import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const resourceChild = sequelizeClient.define('resource_child', {
    text: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (resourceChild as any).associate = (models: any) => {
    (resourceChild as any).belongsTo(models.resource, { foreignKey: 'resourceParent' });
    (resourceChild as any).belongsTo(models.resource, { foreignKey: 'resourceChild' })
  }

  return resourceChild
}
