import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
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

  // eslint-disable-next-line no-unused-vars
  (resource as any).associate = (models: any) => {
    (resource as any).hasOne(models.attribution);
    (resource as any).hasOne(models.resource_type);
    (resource as any).belongsToMany(models.component, { through: models.component_resource });
    (resource as any).belongsToMany(models.resource, { through: models.resource_child, as: 'parentResource' });
    (resource as any).belongsToMany(models.resource, { through: models.resource_child, as: 'childResource' })
  }

  return resource
}
