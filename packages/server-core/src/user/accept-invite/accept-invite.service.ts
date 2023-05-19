// Initializes the `accept-invite` service on path `/accept-invite`

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { AcceptInvite } from './accept-invite.class'
import hooks from './accept-invite.hooks'

/**
 * accept invite service
 */
declare module '@etherealengine/common/declarations' {
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
async function redirect(ctx, next) {
  try {
    const data = ctx.body
    if (data.error) {
      ctx.redirect(`${config.client.url}/?error=${data.error as string}`)
    } else {
      let link = `${config.client.url}/auth/magiclink?type=login&token=${data.token as string}`
      if (data.locationName) {
        let path = `/location/${data.locationName}`
        if (data.inviteCode) {
          path += path.indexOf('?') > -1 ? `&inviteCode=${data.inviteCode}` : `?inviteCode=${data.inviteCode}`
        }
        if (data.spawnPoint) {
          path += path.indexOf('?') > -1 ? `&spawnPoint=${data.spawnPoint}` : `?spawnPoint=${data.spawnPoint}`
        }
        if (data.spectate) {
          path += path.indexOf('?') > -1 ? `&spectate=${data.spectate}` : `?spectate=${data.spectate}`
        }
        if (data.instanceId) {
          path += `&instanceId=${data.instanceId}`
        }
        link += `&path=${path}`
      }
      ctx.redirect(link)
    }
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
  app.use('a-i', event, { koa: { after: [redirect] } })
  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('a-i')

  service.hooks(hooks)
}
