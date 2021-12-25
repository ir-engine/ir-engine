import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import Paginated from '../../types/PageObject'
import { BadRequest } from '@feathersjs/errors'
import logger from '../../logger'
import blockchainTokenGenerator from '../../util/blockchainTokenGenerator'
import blockchainUserWalletSend from '../../util/blockchainUserWalletSend'

interface Data {}
interface ServiceOptions {}
/**
 * A class for Collection type service
 *
 * @author DRC
 */
export class UserInventory extends Service {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }
  async patch(id: NullableId, data: any, params: Params): Promise<Data> {
    if (data.type === 'transfer') {
      let { fromUserId, toUserId, quantity, walletAmt } = data
      let response: any = await blockchainTokenGenerator()
      const accessToken = response?.data?.accessToken
      let walleteResponse = await blockchainUserWalletSend(fromUserId, toUserId, walletAmt, accessToken)
    }

    let userInventoryId = id
    return await super.patch(userInventoryId, data)
  }
}
