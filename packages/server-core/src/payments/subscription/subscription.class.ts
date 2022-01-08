import { Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '../../../declarations'
import config from '../../appconfig'

export class Subscription extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   *
   * @param data for creating new subscription
   * @param params which contains user info
   * @returns {@Object} of created new subscription
   * @author
   */
  async create(data: any, params: Params): Promise<any> {
    const userId = (params as any).connection['identity-provider'].userId || params.body.userId
    if (userId == null) {
      throw new Error('Invalid user')
    }

    const unconfirmedSubscriptions = (await super.find({
      query: {
        userId: userId,
        status: 0
      }
    })) as any

    await Promise.all(
      unconfirmedSubscriptions.data.map((subscription: any) => {
        return super.remove(subscription.id)
      })
    )
    let plan: string
    const found = await this.app.service('subscription-type').find({
      query: {
        plan: data.plan
      }
    })
    if (!found) {
      plan = 'monthly-subscription-free'
    } else {
      plan = data.plan
    }
    const saveData = {
      userId,
      plan,
      amount: (found as any).data[0].amount ?? 0,
      quantity: 1
    }
    const saved = await super.create(saveData, params)

    const returned = {
      subscriptionId: saved.id,
      paymentUrl: `https://${config.chargebee.url}/hosted_pages/plans/${plan}?subscription[id]=${
        saved.id as string
      }&customer[id]=${userId as string}`
    }

    return returned
  }
}
