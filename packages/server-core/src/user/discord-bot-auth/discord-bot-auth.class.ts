import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import Paginated from '../../types/PageObject'
import { Application } from '../../../declarations'
import axios from "axios";
import config from '../../appconfig'

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
    console.log('params', params)
    let url = `https://discord.com/api/oauth2/authorize?client_id=${config.authentication.oauth.discord.key}&scope=bot&permissions=1`
    if (params.query.guild_id) url = url + `&guild_id=${params.query.guild_id}&disable_guild_select=true`
    try {
      const authResponse = await axios.get(
          url,
          // {
          //   headers: {
          //     Authorization: `Bearer ${params.query.bot_token}`
          //   }
          // }
      )
      console.log('authResponse', authResponse)
    } catch(err) {
      console.log('error', err)
    }
  }
}
