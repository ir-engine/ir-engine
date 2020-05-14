import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const staticResource = sequelizeClient.define('static_resource', {
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

  (staticResource as any).associate = (models: any) => {
    (staticResource as any).belongsTo(models.static_resource_type, { foreignKey: 'staticResourceType', required: true });
    (staticResource as any).belongsTo(models.attribution);
    (staticResource as any).belongsToMany(models.component, { through: 'static_resource_component' });
    (staticResource as any).belongsTo(models.user);
    (staticResource as any).hasMany(models.static_resource, { as: 'parent', foreignKey: 'parentResourceId', allowNull: true })
  }

  return staticResource
}
