import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'

export type ComponentModelType = {
  id: string
  name: any
  props: any
  data: any
  entityId: string
}

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const component = sequelizeClient.define<Model<ComponentModelType>>(
    'component',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.VIRTUAL,
        get(this: any): any {
          return this.type
        }
      },
      // We need to get this for making compatible with editor
      props: {
        type: DataTypes.VIRTUAL,
        get(this: any): any {
          if (!this.data) {
            return {}
          } else {
            return this.data
          }
        }
      },
      data: {
        type: DataTypes.JSON,
        allowNull: true,
        get(this: any): any {
          const data = this.getDataValue('data')
          if (!data) {
            return {}
          } else {
            if (typeof data === 'string' && data.match(/^{.*}$/)) {
              return JSON.parse(data)
            } else {
              return data
            }
          }
        }
      },
      entityId: {
        type: DataTypes.UUID
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
  ;(component as any).associate = (models: any): void => {
    ;(component as any).belongsTo(models.component_type, { foreignKey: 'type', required: false, constraints: false })
    ;(component as any).belongsTo(models.entity, {
      as: 'entity',
      foreignKey: 'entityId',
      required: false,
      constraints: false,
      onDelete: 'cascade',
      hooks: true
    })
    ;(component as any).hasMany(models.static_resource, { constraints: false })
  }

  return component
}
