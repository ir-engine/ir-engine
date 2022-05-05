import { Application } from '../../../declarations'
import { DicscordBotAuth } from './discord-bot-auth.class'
import hooks from './discord-bot-auth.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'discord-bot-auth': DicscordBotAuth
  }
}

export default (app: Application) => {
  const options = {
    paginate: app.get('paginate')
  }

  const event = new DicscordBotAuth(options, app)
  app.use('discord-bot-auth', event)

  const service = app.service('discord-bot-auth')
  service.hooks(hooks)
}
