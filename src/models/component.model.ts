import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const component = sequelizeClient.define('component', {
    data: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (component as any).associate = (models: any) => {
    (component as any).belongsTo(models.component_type, { foreignKey: 'type', required: true, primaryKey: true });
    (component as any).belongsTo(models.entity, { required: true, primaryKey: true });
    (component as any).hasMany(models.static_resource)
  }

  return component
}
