import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userWallet = sequelizeClient.define(
    'user_wallet',
    {
      status: {
        type: DataTypes.STRING
      },
      userMnemonic: {
        type: DataTypes.STRING
      },
      userAddress: {
        type: DataTypes.STRING
      },
      privateKey: {
        type: DataTypes.STRING
      },
      error: {
        type: DataTypes.STRING
      },
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

  ;(userWallet as any).assocate = (models: any): void => {}
  return userWallet
}
