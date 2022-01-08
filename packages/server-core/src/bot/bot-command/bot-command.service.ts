import { Application } from '../../../declarations'
import hooks from './Bot-command.hooks'
import { BotCommand } from './bot-command.class'
import docs from './bot-command.docs'
import createModel from './bot-command.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'bot-command': BotCommand
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new BotCommand(options, app)
  event.docs = docs
  app.use('bot-command', event)

  const service = app.service('bot-command')

  service.hooks(hooks)
}
