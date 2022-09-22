import { Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { SubscriptionInterface } from '@xrengine/common/src/dbmodels/Subscription'

import { Application } from '../../../declarations'
import config from '../../appconfig'

interface SubscriptionParams extends Params {
  body?: {
    userId: string
  }
}

export type SubscriptionDataType = SubscriptionInterface & { subscriptionId: string; paymentUrl: string }

export class Subscription<T = SubscriptionDataType> extends Service<T> {
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
   */
  async create(data: any, params?: SubscriptionParams): Promise<T> {
    const userId = (params as any).connection['identity-provider'].userId || params?.body?.userId
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
    const saveData: any = {
      userId,
      plan,
      amount: (found as any).data[0].amount ?? 0,
      quantity: 1
    }
    const saved: any = await super.create(saveData, params)

    const returned: any = {
      subscriptionId: saved.id.toString(),
      paymentUrl: `https://${config.chargebee.url}/hosted_pages/plans/${plan}?subscription[id]=${
        saved.id as string
      }&customer[id]=${userId as string}`
    }

    return returned as T
  }
}
