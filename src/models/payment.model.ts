// See http://docs.sequelizejs.com/en/latest/docs/models-definition/
// for more of what you can do here.
import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  // prettier-ignore
  const payment = sequelizeClient.define(
    'payment',
    {
      sessionId: {
        type: DataTypes.STRING,
        allowNull: false
      },
      customer: {
        type: DataTypes.STRING,
        allowNull: true
      },
      customer_email: {
        type: DataTypes.STRING,
        allowNull: true
      },
      item: {
        type: DataTypes.STRING,
        allowNull: true
      },
      amount: {
        type: DataTypes.INTEGER,
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
      payment_method: {
        type: DataTypes.STRING,
        allowNull: false
      },
      payment_intent: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      hooks: {
        // eslint-disable-next-line
        beforeCount(options: any) {
          options.raw = true
        }
      }
    }
  )

  // eslint-disable-next-line no-unused-vars
  ;
  // prettier-ignore
  ;(payment as any).associate = function (models: any) {
    // Define customer associations later
    // See http://docs.sequelizejs.com/en/latest/docs/associations/
  }

  return payment
}
