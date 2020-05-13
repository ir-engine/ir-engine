import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userRelationshipType = sequelizeClient.define('user_relationship_type', {
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true
    }
  }, {
    hooks: {
      beforeCount (options: any) {
        options.raw = true
      },
      beforeUpdate (instance: any, options: any) {
        throw new Error("Can't update a type!")
      }
    },
    timestamps: false
  });

  (userRelationshipType as any).associate = (models: any) => {
    (userRelationshipType as any).hasMany(models.user_relationship, { foreignKey: 'type' })
  }

  return userRelationshipType
}
