import { DataTypes, Sequelize } from 'sequelize'

import { Application } from '../../../declarations'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const userInventory = sequelizeClient.define(
    'user_inventory',
    {
      userInventoryId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      addedOn: {
        type: DataTypes.DATE
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

  ;(userInventory as any).assocate = (models: any): void => {
    ;(userInventory as any).belongsTo(models.inventory_item, { required: true, allowNull: false })
    ;(userInventory as any).belongsTo(models.user, { required: true, allowNull: false })
  }

  return userInventory
}
