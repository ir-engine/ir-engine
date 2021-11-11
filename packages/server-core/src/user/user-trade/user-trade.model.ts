import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userTrade = sequelizeClient.define(
    'user_trade',
    {
      userTradeId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      fromUserStatus: {
        type: DataTypes.STRING
      },
      toUserStatus: {
        type: DataTypes.STRING
      },
      addedOn: {
        type: DataTypes.DATE
      },
      fromUserInventoryIds:{
        type: DataTypes.JSON
      },
      toUserInventoryIds:{
        type: DataTypes.JSON
      }
    },
    {
      hooks: {
        beforeCount(options: any): void {
          options.raw = true
        }
      },
      timestamps: false
    }
  )

  ;(userTrade as any).assocate = (models: any): void => {
  }
  return userTrade
}
