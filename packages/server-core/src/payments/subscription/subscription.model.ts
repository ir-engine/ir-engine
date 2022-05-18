import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application) => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const subscription = sequelizeClient.define(
    'subscription',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      plan: {
        type: DataTypes.STRING,
        allowNull: true
      },
      amount: {
        type: DataTypes.DECIMAL,
        allowNull: false
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: 'usd',
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      totalSeats: {
        type: DataTypes.INTEGER
      },
      unusedSeats: {
        type: DataTypes.INTEGER
      },
      pendingSeats: {
        type: DataTypes.INTEGER
      },
      filledSeats: {
        type: DataTypes.INTEGER
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

  ;(subscription as any).associate = (models: any): void => {
    ;(subscription as any).belongsTo(models.user)
    ;(subscription as any).belongsTo(models.subscription_type, { foreignKey: 'plan', required: true })
    ;(subscription as any).hasMany(models.seat, { foreignKey: 'subscriptionId' })
  }

  return subscription
}
