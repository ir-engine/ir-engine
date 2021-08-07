import { DataTypes, Sequelize } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const ScopeType = sequelizeClient.define(
    'scopeType',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      location: {
        type: DataTypes.ENUM,
        values: ['read', 'write'],
        allowNull: false
      },
      scene: {
        type: DataTypes.ENUM,
        values: ['read', 'write'],
        allowNull: false
      },
      static_resource: {
        type: DataTypes.ENUM,
        values: ['read', 'write'],
        allowNull: false
      },
      editor: {
        type: DataTypes.ENUM,
        values: ['write'],
        allowNull: false
      },
      bot: {
        type: DataTypes.ENUM,
        values: ['read', 'write'],
        allowNull: false
      },
      globalAvatars: {
        type: DataTypes.ENUM,
        values: ['read', 'write'],
        allowNull: false
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
  ;(ScopeType as any).associate = (models: any): void => {
    ;(ScopeType as any).belongsTo(models.scope, { foreignKey: 'scopeName' })
  }

  return ScopeType
}
