import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import config from '../../appconfig'
interface Data {}

interface ServiceOptions {}

export class Meta implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  /**
   * A function which is used to find meta
   *
   * @param params
   * @returns {@Object}
   */
  async find(params: Params): Promise<Data> {
    const [dbServerConfig] = await this.app.service('server-setting').find()
    const serverConfig = dbServerConfig || config.server

    // SPOKE HACK: This method is just returning the collection API endpoint for uploading the file from editor
    return {
      phx_host: serverConfig.url // FIXME
    }
  }

  /**
   * A function which is used to get specific meta
   *
   * @param id of specific id
   * @param params
   * @returns {@Object} contains meta id and message
   * @author  Vyacheslav Solovjov
   */
  async get(id: Id, params: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`
    }
  }

  /**
   * A function which is used to create new meta
   *
   * @param data for new meta
   * @param params
   * @returns {@Object} created meta
   * @author  Vyacheslav Solovjov
   */
  async create(data: Data, params: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current, params)))
    }

    return data
  }

  /**
   * A function which used to update meta
   *
   * @param id
   * @param data used to update meta
   * @param params
   * @returns {@Object} update meta
   * @author  Vyacheslav Solovjov
   */
  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  /**
   * A function which used to update meta
   *
   * @param id
   * @param data used to update meta
   * @param params
   * @returns {@Object} update meta
   * @author  Vyacheslav Solovjov
   */
  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  /**
   * A function which is used to remove specific meta
   *
   * @param id of specific meta
   * @param params
   * @returns {@Object} removed data
   */
  async remove(id: NullableId, params: Params): Promise<Data> {
    return { id }
  }
}
