import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import Paginated from '../../types/PageObject'
import { Application } from '../../../declarations'
import axios from "axios";
import config from '../../appconfig'
import { errors } from '@feathersjs/errors'

interface Data {}

interface ServiceOptions {}

/**
 * accept invite class for get, create, update and remove user invite
 *
 */
export class DicscordBotAuth implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  /**
   * A function which help to find all accept invite and display it
   *
   * @param params number of limit and skip for pagination
   * Number should be passed as query parmas
   * @returns {@Array} all listed invite
   * @author Vyacheslav Solovjov
   */
  async find(params: Params): Promise<Data[] | Paginated<Data>> {
    const url = `https://discord.com/api/users/@me`
    try {
      const authResponse = await axios.get(
          url,
          {
            headers: {
              Authorization: `Bot ${params.query.bot_token}`
            }
          }
      )
      const resData = authResponse.data
      if (!resData?.bot) throw new Error('The authenticated Discord user is not a bot')
      const token = `discord:::${resData.id}`
      const ipResult = await this.app.service('identity-provider').find({
        query: {
          token: token,
          type: 'discord'
        }
      })
      if (ipResult.total > 0) {
        return this.app.service('user').get(ipResult.data[0].userId)
      } else {
        const ipCreation = await this.app.service('identity-provider').create({
          token: token,
          type: 'discord'
        }, {
          bot: true
        })
        return this.app.service('user').get(ipCreation.userId)
      }
    } catch(err) {
      console.log(err)
      if (errors[err.response.status]) throw new errors[err.response.status]
      else throw new Error(err)
    }
  }
}
