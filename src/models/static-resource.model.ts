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
      type: DataTypes.STRING(1023),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mimeType: {
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
    (staticResource as any).hasOne(models.attribution);
    (staticResource as any).belongsToMany(models.component, { through: 'static_resource_component' });
    (staticResource as any).belongsTo(models.user);
    (staticResource as any).hasMany(models.static_resource, { as: 'parent', foreignKey: 'parentResourceId', allowNull: true });
    (staticResource as any).belongsTo(models.subscription_level, { foreignKey: 'subscriptionLevel' })
  }

  return staticResource
}
