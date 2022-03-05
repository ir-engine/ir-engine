import { DataTypes, Model, Sequelize } from 'sequelize'

import { SubscriptionLevelInterface } from '@xrengine/common/src/dbmodels/SubscriptionLevel'

import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const subscriptionLevel = sequelizeClient.define<Model<SubscriptionLevelInterface>>(
    'subscription_level',
    {
      level: {
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

  ;(subscriptionLevel as any).associate = (models: any): void => {
    ;(subscriptionLevel as any).hasMany(models.static_resource, { foreignKey: 'subscriptionLevel' })
  }

  return subscriptionLevel
}
