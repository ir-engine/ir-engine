import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'
import generateShortId from '../util/generate-short-id'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const collection = sequelizeClient.define('collection', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      allowNull: false,
      primaryKey: true
    },
    sid: {
      type: DataTypes.STRING,
      defaultValue: () => generateShortId(8),
      allowNull: false
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
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      }
    }
  });

  (collection as any).associate = (models: any) => {
    (collection as any).belongsTo(models.collection_type, { foreignKey: 'collectionType', required: true });
    (collection as any).hasOne(models.attribution);
    (collection as any).hasMany(models.entity);
    (collection as any).belongsTo(models.user);
    (collection as any).belongsTo(models.location)
  }

  return collection
}
