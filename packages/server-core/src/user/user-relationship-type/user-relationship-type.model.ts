import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRelationshipType = sequelizeClient.define(
    'user_relationship_type',
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

  ;(userRelationshipType as any).associate = (models: any): void => {
    ;(userRelationshipType as any).hasMany(models.user_relationship, { foreignKey: 'userRelationshipType' })
  }

  return userRelationshipType
}
