import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Params } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import app from './../../app'

export class Subscription extends Service {
  // prettier-ignore
  plans: Array<{ planId: string, type: string, name: string, amount: number }>
  // prettier-ignore
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.plans = [
      { planId: 'trek', name: 'Monthly Subscription | Trek', type: 'monthly', amount: 37.99 },
      { planId: 'journey', name: 'Monthly Subscription | Journey', type: 'monthly', amount: 9.99 },
      { planId: 'voyage', name: 'Monthly Subscription | Voyage', type: 'monthly', amount: 87.99 },
      { planId: 'adventure', name: 'Monthly Subscription | Adventure', type: 'monthly', amount: 174.99 },
      { planId: 'annual-subscription-|-journey', name: 'Annual Subscription | Journey', type: 'annual', amount: 94.99 },
      { planId: 'annual-subscription-|-trek', name: 'Annual Subscription | Trek', type: 'annual', amount: 364.99 },
      { planId: 'annual-subscription-|-voyage', name: 'Annual Subscription | Voyage', type: 'annual', amount: 844.99 },
      { planId: 'annual-subscription-|-adventure', name: 'Annual Subscription | Adventure', type: 'annual', amount: 1679.99 },
      { planId: 'monthly-subscription-free', name: 'Monthly Subscription | Free', type: 'monthly', amount: 0 }
    ]
  }

  // prettier-ignore
  async create (data: any, params: Params): Promise<any> {
    const user = app.service('user').create({})
    // @ts-ignore
    // const userId = params?.connection['identity-provider'].userId || user.id
    const userId = user.id
    let plan: string
    const found = this.plans.find(plan => data.planId)
    if (!found) {
      plan = 'monthly-subscription-free'
    } else {
      plan = data.planId
    }
    const saveData = {
      userId,
      plan,
      amount: found?.amount ?? 0,
      quantity: 1
    }
    const saved = await super.create(saveData, params)
    return {
      subscriptionId: saved.id,
      paymentUrl: `https://kaixr-test.chargebee.com/hosted_pages/plans/${plan}`
    }
  }

  // prettier-ignore
  async find (params: Params): Promise<any> {
    return {
      plans: this.plans
    }
  }
}
