// Initializes the `accept-invite` service on path `/accept-invite`
import { Application } from '../../../declarations'
import { DicscordBotAuth } from './discord-bot-auth.class'
import hooks from './discord-bot-auth.hooks'
import config from '../../appconfig'
import logger from '../../logger'

/**
 * accept invite service
 */
declare module '../../../declarations' {
  interface ServiceTypes {
    'discord-bot-auth': DicscordBotAuth
  }
}

/**
 * A function which returns url to the client
 *
 * @returns redirect url to the client
 * @author Vyacheslav Solovjov
 */

export default (app: Application) => {
  const options = {
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires
   * @author  Vyacheslav Solovjov
   */
  const event = new DicscordBotAuth(options, app)
  app.use('discord-bot-auth', event)

  /**
   * Get our initialized service so that we can register hooks
   * @author Vyacheslav Solovjov
   */
  const service = app.service('discord-bot-auth')

  service.hooks(hooks)
}
