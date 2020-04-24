import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const resource = sequelizeClient.define('resource', {
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

  (resource as any).associate = (models: any) => {
    (resource as any).belongsTo(models.resource_type);
    (resource as any).belongsTo(models.attribution, { through: 'resource_attribution' });
    (resource as any).belongsToMany(models.component, { through: 'resource_component' });
    (resource as any).belongsTo(models.user);
    (resource as any).belongsTo(models.resource, { as: 'parent', foreignKey: 'parentId' });
    (resource as any).hasMany(models.resource, { as: 'children', foreignKey: 'childId' })
  }

  return resource
}
