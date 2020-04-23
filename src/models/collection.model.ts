import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default function (app: Application): any {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const collection = sequelizeClient.define('collection', {
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
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      allowNull: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (collection as any).associate = (models: any) => {
    (collection as any).hasOne(models.collection_type);
    (collection as any).hasOne(models.attribution);
    (collection as any).hasMany(models.entity, { through: models.collection_entity });
    (collection as any).belongsToMany(models.user, { through: models.user_collection });
    (collection as any).belongsToMany(models.location, { through: models.location_collection })
  }

  return collection
}
