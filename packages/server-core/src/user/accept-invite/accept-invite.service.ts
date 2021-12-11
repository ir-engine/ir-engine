// Initializes the `accept-invite` service on path `/accept-invite`
import { Application } from '../../../declarations'
import { AcceptInvite } from './accept-invite.class'
import hooks from './accept-invite.hooks'
import config from '../../appconfig'
import logger from '../../logger'

/**
 * accept invite service
 */
declare module '../../../declarations' {
  interface ServiceTypes {
    'a-i': AcceptInvite
  }
}

/**
 * A function which returns url to the client
 *
 * @param req
 * @param res response to the client
 * @param next
 * @returns redirect url to the client
 * @author Vyacheslav Solovjov
 */

function redirect(req, res, next): Promise<any> {
  try {
    if (res.data.error) {
      return res.redirect(`${config.client.url}/?error=${res.data.error as string}`)
    }
    return res.redirect(`${config.client.url}/auth/magiclink?type=login&token=${res.data.token as string}`)
  } catch (err) {
    logger.error(err)
    throw err
  }
}

export default (app: Application) => {
  const options = {
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires
   * @author  Vyacheslav Solovjov
   */
  const event = new AcceptInvite(options, app)
  app.use('a-i', event, redirect)

  /**
   * Get our initialized service so that we can register hooks
   * @author Vyacheslav Solovjov
   */
  const service = app.service('a-i')

  service.hooks(hooks)
}
