import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const resource = sequelizeClient.define('resource', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
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
    (resource as any).hasOne(models.resource_type);
    (resource as any).hasOne(models.attribution);
    (resource as any).belongsToMany(models.component, { through: 'resource_component' });
    (resource as any).belongsTo(models.user);
    (resource as any).belongsToMany(models.resource, { through: 'resource_child', as: 'childResource' })
  }

  return resource
}
