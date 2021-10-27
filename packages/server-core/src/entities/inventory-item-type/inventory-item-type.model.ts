import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'
import { inventoryItemType as inventoryItemTypeEnum } from './inventoryItemType'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const inventoryItemType = sequelizeClient.define(
    'inventory_item_type',
    {
      inventoryItemType: {
        type: DataTypes.STRING,
        allowNull: false,
        // primaryKey: true,
        unique: true,
        values: Object.keys(inventoryItemTypeEnum )
      },
       inventoryItemTypeId : {
         type: DataTypes.UUID,
         defaultValue: DataTypes.UUIDV1,
         allowNull: false,
         primaryKey: true,
         unique: true,
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

  ;(inventoryItemType as any).associate = (models: any): void => { 
    ;(inventoryItemType as any).hasMany(models.inventory_item, { foreignKey: 'inventoryItemTypeId', required: true})
  }

  return inventoryItemType
}
