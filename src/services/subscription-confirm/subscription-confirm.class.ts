import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import app from './../../app'

interface Data {}

interface ServiceOptions {}

export class SubscriptionConfirm implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  async get (id: Id, params?: Params): Promise<Data> {
    // const userId = (params as any)['identity-provider'].userId
    // console.log(userId)
    const unconfirmedSubscription = await app.service('subscription').find({
      where: {
        id: id,
        status: 0
      }
    })
    if ((unconfirmedSubscription as any).total > 0) {
      await app.service('subscription').patch(id, {
        status: 1,
        customerId: (params as any).query.customer_id
      })
      return await Promise.resolve({})
    } else {
      return await Promise.reject(new Error('Subscription not found'))
    }
  }

  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(current => this.create(current, params)))
    }

    return data
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }
}
