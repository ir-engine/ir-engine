import { errors } from '@feathersjs/errors'
import { Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import { SequelizeServiceOptions } from 'feathers-sequelize/types'
import fetch from 'node-fetch'

import { IdentityProviderInterface } from '@etherealengine/common/src/dbmodels/IdentityProvider'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'

export class DicscordBotAuth<T = any> implements Partial<ServiceMethods<T>> {
  app: Application
  docs: any
  options: Partial<SequelizeServiceOptions>

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    this.options = options
    this.app = app
  }

  async find(params?: Params): Promise<any> {
    const url = `https://discord.com/api/users/@me`
    try {
      const authResponse = await fetch(url, {
        headers: {
          Authorization: `Bot ${params!.query!.bot_token}`
        }
      })
      const resData = JSON.parse(Buffer.from(await authResponse.arrayBuffer()).toString())
      if (!resData?.bot) throw new Error('The authenticated Discord user is not a bot')
      const token = `discord:::${resData.id}`
      const ipResult = (await this.app.service('identity-provider').find({
        query: {
          token: token,
          type: 'discord'
        }
      })) as Paginated<IdentityProviderInterface>
      if (ipResult.total > 0) {
        return this.app.service('user').get(ipResult.data[0].userId)
      } else {
        const ipCreation = await this.app.service('identity-provider').create(
          {
            token: token,
            type: 'discord'
          },
          {
            bot: true
          }
        )
        return this.app.service('user').get(ipCreation.userId)
      }
    } catch (err) {
      logger.error(err)
      if (errors[err.response.status]) {
        throw new errors[err.response.status]()
      } else {
        throw new Error(err)
      }
    }
  }
}
