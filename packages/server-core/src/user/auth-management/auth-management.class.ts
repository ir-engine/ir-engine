import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import Paginated from '../../types/PageObject'
import { Application } from '../../../declarations'

interface Data {}

interface ServiceOptions {}

/**
 * authManagement class for GET, CREATE, UPDATE AND REMOVE.
 *
 */
export class Authmanagement implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  /**
   * A function which help to find all auth
   *
   * @param params
   * @returns {@Array} all listed auth
   * @author Vyacheslav Solovjov
   */

  async find(params: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  /**
   * A function which display specific auth
   *
   * @param id of specific auth
   * @param params
   * @returns {@Object} contain single auth
   * @author Vyacheslav Solovjov
   */

  async get(id: Id, params: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`
    }
  }

  /**
   * A function whivh create new auth
   *
   * @param data wich will be used for creating new auth
   * @param params
   * @author Vyacheslav Solovjov
   */
  async create(data: Data, params: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current, params)))
    }

    return data
  }

  /**
   * A function which update auth
   *
   * @param id
   * @param data for updating auth
   * @param params
   * @author Vyacheslav Solovjov
   */

  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  /**
   * A function which update auth
   * @param id
   * @param data of updating auth
   * @param params
   * @returns {@Object} data which contains auth
   */

  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  /**
   * A function which remove specific auth
   *
   * @param id of specific auth
   * @param params
   * @returns id
   */
  async remove(id: NullableId, params: Params): Promise<Data> {
    return { id }
  }
}
