import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'

import { Application } from '../../../declarations'
import Paginated from '../../types/PageObject'
import { sendSmsWithAWS } from './awssns'

interface Data {}

interface ServiceOptions {}

/**
 * A class for Sms service
 *
 * @author Vyacheslav Solovjov
 */
export class Sms implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  async find(params: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  async get(id: Id, params: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`
    }
  }

  async create(data: any, params: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current, params)))
    }

    await sendSmsWithAWS(data.mobile, data.text)
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
