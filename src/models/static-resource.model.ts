import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const staticResource = sequelizeClient.define('static_resource', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    metadata: {
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

  (staticResource as any).associate = (models: any) => {
    (staticResource as any).belongsTo(models.static_resource_type, { foreignKey: 'type' });
    (staticResource as any).belongsTo(models.attribution);
    (staticResource as any).belongsToMany(models.component, { through: 'static_resource_component' });
    (staticResource as any).belongsTo(models.user);
    (staticResource as any).belongsToMany(models.static_resource, { as: 'parent', foreignKey: 'parentId', through: 'static_resource_relationship' });
    (staticResource as any).belongsToMany(models.static_resource, { as: 'child', foreignKey: 'childId', through: 'static_resource_relationship' })
  }

  return staticResource
}
