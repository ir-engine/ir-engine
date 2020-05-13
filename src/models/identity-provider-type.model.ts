import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const identityProviderType = sequelizeClient.define('identity_provider_type', {
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

  (identityProviderType as any).associate = function (models: any) {
    (identityProviderType as any).hasMany(models.identity_provider, { foreignKey: 'type' })
  }

  return identityProviderType
}
