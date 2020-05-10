import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const component = sequelizeClient.define('component', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
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
    (component as any).belongsTo(models.component_type, { foreignKey: 'type', required: true });
    (component as any).belongsToMany(models.static_resource, { through: 'static_resource_component' });
    (component as any).belongsTo(models.entity, { required: true })
  }

  return component
}
