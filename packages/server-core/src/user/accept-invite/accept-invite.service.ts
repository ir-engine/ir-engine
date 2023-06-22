/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
