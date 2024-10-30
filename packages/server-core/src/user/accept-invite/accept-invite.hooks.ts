/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { disallow } from 'feathers-hooks-common'
import logger from '../../ServerLogger'
import config from '../../appconfig'

async function redirect(context) {
  try {
    const data = context.result
    if (data.error) {
      context.http.location = `${config.client.url}/?error=${data.error as string}`
    } else {
      let link = `${context.params.domain || config.client.url}/auth/magiclink?type=login&token=${data.token as string}`
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
      context.http.location = link
    }
  } catch (err) {
    logger.error(err)
    throw err
  }
}

export default {
  before: {
    all: [],
    find: [disallow()],
    get: [],
    create: [disallow()],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [redirect],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
