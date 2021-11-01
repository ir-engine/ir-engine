import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { QueryTypes } from 'sequelize'

/**
 * A class for Collection type service
 *
 * @author DRC
 */
export class UserInventory extends Service {
  app: Application
  public docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params: Params): Promise<any> {
    const skip = params.query?.$skip ? params.query.$skip : 0
    const limit = params.query?.$limit ? params.query.$limit : 10
    const userId = params.query?.userId ? params.query.userId : ''

    const userInventoryItems = await (this.app.service('user-inventory') as any).Model.findAndCountAll({
      offset: skip,
      limit: limit,
      userId: userId
    })

    const dataQuery = `SELECT userInventory.userInventoryId, userInventory.quantity,userInventory.userId ,inventoryItem.*  
    FROM \`user_inventory\` as userInventory
    JOIN \`inventory_item\` as inventoryItem ON inventoryItem.inventoryItemId=userInventory.inventoryItemId
    WHERE userInventory.userId = \'${userId}\'
    GROUP BY userInventory.userInventoryId
    ORDER BY userInventory.addedOn DESC    
    LIMIT ${skip}, ${limit}`

    const userInventoryResult = await this.app.get('sequelizeClient').query(dataQuery, {
      type: QueryTypes.SELECT,
      raw: true
    })

    return {
      skip: skip,
      limit: limit,
      total: userInventoryItems.count,
      data: userInventoryResult
    }
  }
}
