import { DataTypes, Sequelize } from 'sequelize'

import { Application } from '../../../declarations'
import generateShortId from '../../util/generate-short-id'

//import config from '../../appconfig'

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
      isCoin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
  }
  //A.belongsToMany(B, { through: 'C' });

  return inventoryItem
}
