import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { Params } from '@feathersjs/feathers'
import Stripe from 'stripe'
import config from 'config'
import chargebee from 'chargebee'

const stripe = new Stripe(config.get('stripe_secret'), {
  apiVersion: '2020-03-02'
})

chargebee.configure({
  site: config.get('chargebee_site'),
  api_key: config.get('chargebee_api_key')
})

export class Payment extends Service {
  // eslint-disable-next-line
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  // prettier-ignore
  async create (data: any, params: Params): Promise<any> {
    // create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        name: data.name,
        description: 'lorem ipsum dolor sit amet',
        images: ['https://picsum.photos/200'], // A random image
        amount: data.amount,
        currency: 'usd',
        quantity: data.quantity
      }],
      success_url: 'http://localhost:3030/payment?session_id=xyz',
      cancel_url: 'http://localhost:3030/'
    })

    // save to DB
    const saveData = {
      sessionId: session.id,
      customer: session.customer,
      customer_email: session.customer_email,
      item: data.name,
      amount: data.amount,
      quantity: data.quantity,
      payment_method: session.payment_method_types[0],
      payment_intent: session.payment_intent
    }

    // Add to chagebee subscription - Test Data modify later
    chargebee.subscription.create({
      plan_id: 'no_trial',
      auto_collection: 'off',
      billing_address: {
        first_name: 'John',
        last_name: 'Doe',
        line1: 'PO Box 9999',
        city: 'Walnut',
        state: 'California',
        zip: '91789',
        country: 'US'
      },
      customer: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@user.com'
      }
    }).request((error: any, result: any) => {
      if (error) {
        // handle error
        console.log(error)
      } else {
        console.log(result)
      }
    })
    return await super.create(saveData, params)
  }

  // prettier-ignore
  async find (params: Params): Promise<any> {
    // success url hit
    if (!params.query || !params.query.session_id) return { status: 'fail', message: 'Bad request' }
    return { status: 'success', message: 'payment sucessful!' }
  }
}
