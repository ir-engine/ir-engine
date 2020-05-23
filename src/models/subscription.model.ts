import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  // prettier-ignore
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
        type: DataTypes.FLOAT,
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
      }
    },
    {
      hooks: {
        beforeCount (options: any) {
          options.raw = true
        }
      }
    }
  )

  // eslint-disable-next-line no-unused-vars
  ;(subscription as any).associate = (models: any) => {
    // Define associations here
    (subscription as any).belongsTo(models.user)
    ;(subscription as any).belongsTo(models.subscription_type, { foreignKey: 'plan', required: true })
  }

  return subscription
}
