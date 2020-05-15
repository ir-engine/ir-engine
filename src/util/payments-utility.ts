import Stripe from 'stripe'
import config from 'config'
// import schedule from 'node-schedule'

const stripe = new Stripe(config.get('stripe_secret'), {
  apiVersion: config.get('stripe_api_version')
})

const schedulePaymentHook = async (): Promise<any> => {
  const events = stripe.events.list({
    type: 'checkout.session.completed',
    created: {
      // Check for successful payments in the last 24 hours.
      gte: Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000)
    }
  })
  for await (const event of events) {
    const session = event.data.object
    console.log(session)
    // Implement it later...
    // handlePaymentOrder(session)
  }
}
schedulePaymentHook()
  .then(data => console.log(data))
  .catch(err => console.error(err))
// schedule.scheduleJob('59 23 * * *', schedulePaymentHook)
