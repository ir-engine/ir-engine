import { Application } from '../../../declarations'
import { Bot } from './bot.class'
import docs from './bot.docs'
import hooks from './bot.hooks'
import createModel from './bot.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    bot: Bot
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Bot(options, app)
  event.docs = docs
  app.use('bot', event)

  const service = app.service('bot')

  service.hooks(hooks)
}
