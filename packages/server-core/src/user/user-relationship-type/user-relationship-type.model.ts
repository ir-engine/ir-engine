import { Sequelize, DataTypes, Model } from 'sequelize'
import { Application } from '../../../declarations'
import { UserRelationshipTypeInterface } from '@xrengine/common/src/dbmodels/UserRelationshipType'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRelationshipType = sequelizeClient.define<Model<UserRelationshipTypeInterface>>(
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
