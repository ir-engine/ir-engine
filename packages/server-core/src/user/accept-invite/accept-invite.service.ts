// Initializes the `accept-invite` service on path `/accept-invite`
import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { AcceptInvite } from './accept-invite.class'
import hooks from './accept-invite.hooks'

/**
 * accept invite service
 */
declare module '@xrengine/common/declarations' {
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
 */

function redirect(req, res, next): any {
  try {
    if (res.data.error) return res.redirect(`${config.client.url}/?error=${res.data.error as string}`)
    let link = `${config.client.url}/auth/magiclink?type=login&token=${res.data.token as string}`
    if (res.data.locationName) {
      let path = `/location/${res.data.locationName}`
      if (res.data.inviteCode)
        path += path.indexOf('?') > -1 ? `&inviteCode=${res.data.inviteCode}` : `?inviteCode=${res.data.inviteCode}`
      if (res.data.spawnPoint)
        path += path.indexOf('?') > -1 ? `&spawnPoint=${res.data.spawnPoint}` : `?spawnPoint=${res.data.spawnPoint}`
      if (res.data.spectate)
        path += path.indexOf('?') > -1 ? `&spectate=${res.data.spectate}` : `?spectate=${res.data.spectate}`
      if (res.data.instanceId) path += `&instanceId=${res.data.instanceId}`
      link += `&path=${path}`
    }
    return res.redirect(link)
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
   */
  const event = new AcceptInvite(options, app)
  app.use('a-i', event, redirect)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('a-i')

  service.hooks(hooks)
}
