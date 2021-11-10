import { Sequelize, DataTypes } from 'sequelize'
import { Application } from '../../../declarations'
import generateShortId from '../../util/generate-short-id'
import config from '../../appconfig'

export default (app: Application): any => {
  const sequelizeClient: Sequelize = app.get('sequelizeClient')
  const inventoryItem = sequelizeClient.define(
    'inventory_item',
    {
      inventoryItemId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV1,
        allowNull: false,
        primaryKey: true
      },
      sid: {
        type: DataTypes.STRING,
        defaultValue: (): string => generateShortId(8),
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true
      },
      version: DataTypes.INTEGER,
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
        allowNull: true,
        get(this: any): string | JSON {
          const metaData = this.getDataValue('metadata')
          if (!metaData) {
            return ''
          } else {
            return metaData
          }
        }
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false
        // get(this: any): string {
        //   return `${INVENTORY_API_ENDPOINT}/${this.id as string}`
        // },
        // set(): void {
        //   throw new Error('Do not try to set the `url` value!')
        // }
      },
      ownedFileIds: {
        type: DataTypes.TEXT({ length: 'medium' }),
        allowNull: true
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

  ;(inventoryItem as any).associate = (models: any): void => {
    ;(inventoryItem as any).belongsTo(models.inventory_item_type, { foreignKey: 'inventoryItemTypeId', required: true })
    ;(inventoryItem as any).belongsToMany(models.user, {
      through: models.user_inventory,
      foreignKey: 'inventoryItemId'
    })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'fromInventoryItemId1', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'fromInventoryItemId2', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'fromInventoryItemId3', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'fromInventoryItemId4', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'fromInventoryItemId5', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'fromInventoryItemId6', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'fromInventoryItemId7', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'fromInventoryItemId8', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'fromInventoryItemId9', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'fromInventoryItemId10', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'toInventoryItemId1', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'toInventoryItemId2', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'toInventoryItemId3', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'toInventoryItemId4', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'toInventoryItemId5', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'toInventoryItemId6', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'toInventoryItemId7', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'toInventoryItemId8', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'toInventoryItemId9', required: true })
    ;(inventoryItem as any).hasMany(models.user_trade, { foreignKey: 'toInventoryItemId10', required: true })
  }
  //A.belongsToMany(B, { through: 'C' });

  return inventoryItem
}
