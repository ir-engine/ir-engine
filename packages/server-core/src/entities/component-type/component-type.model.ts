import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'

export type CollectionTypeModelType = {
  type: string
}

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const componentType = sequelizeClient.define<Model<CollectionTypeModelType>>(
    'component_type',
    {
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
        unique: true
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        },
        beforeUpdate(instance: any, options: any): void {
          throw new Error("Can't update a type!")
        }
      },
      timestamps: false
    }
  )

  ;(componentType as any).assocate = (models: any): void => {
    ;(componentType as any).hasMany(models.component, { foreignKey: 'type', required: false, constraints: false })
  }

  return componentType
}
