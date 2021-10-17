import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'
import generateShortId from '../../util/generate-short-id'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const staticResource = sequelizeClient.define(
    'static_resource',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      sid: {
        type: DataTypes.STRING,
        defaultValue: (): string => generateShortId(8),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      description: {
        type: DataTypes.STRING(1023),
        allowNull: true
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      key: DataTypes.STRING,
      mimeType: {
        type: DataTypes.STRING,
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      }
    }
  )

  ;(staticResource as any).associate = (models: any): void => {
    ;(staticResource as any).belongsTo(models.static_resource_type, {
      foreignKey: 'staticResourceType',
      required: true
    })
    ;(staticResource as any).belongsToMany(models.component, { through: 'static_resource_component' })
    ;(staticResource as any).belongsTo(models.user)
    ;(staticResource as any).hasMany(models.static_resource, {
      as: 'parent',
      foreignKey: 'parentResourceId',
      allowNull: true
    })
  }

  return staticResource
}
