import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import Paginated from '../../types/PageObject'
import { Application } from '../../../declarations'

interface Data {}

interface ServiceOptions {}

/**
 * A class for Upload Media service
 *
 * @author Vyacheslav Solovjov
 */
export class UploadMedia implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}
  async find(params: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  async get(id: Id, params: Params): Promise<Data> {
    return {}
  }

  async create(data: Data, params: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current, params)))
    }

    return data
  }

  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }

  async remove(id: NullableId, params: Params): Promise<Data> {
    return { id }
  }
}
