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

import { HookContext } from '@feathersjs/feathers/lib/declarations'
import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  readyPlayerMeAccountDataValidator,
  readyPlayerMeAccountPath
} from '@ir-engine/common/src/schemas/integrations/ready-player-me/ready-player-me.schema'
import appConfig from '@ir-engine/server-core/src/appconfig'
import { disallow } from 'feathers-hooks-common'
import fetch from 'node-fetch'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import {
  readyPlayerMeAccountDatResolver,
  readyPlayerMeAccountPatchResolver,
  readyPlayerMeAccountResolver
} from './ready-player-me-account.resolvers'

const createReadyPlayerMeUser = async () => {
  if (!appConfig.readyPlayerMe.apiKey || !appConfig.readyPlayerMe.api) {
    logger.warn('createReadyPlayerMeUser: Missing RPM config', appConfig.readyPlayerMe)
    return ''
  }

  const url = `${appConfig.readyPlayerMe.api}users/`
  const data = { data: { applicationId: appConfig.readyPlayerMe.appId } }

  const response = await (
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': appConfig.readyPlayerMe.apiKey
      },
      body: JSON.stringify(data)
    })
  ).json()
  return response.data
}

const createAccountIfNotExists = async (context: HookContext<Application>) => {
  const [user] = await context.app.service(readyPlayerMeAccountPath).find({
    query: {
      userId: context.params.user?.id
    },
    paginate: false
  })

  if (user) return context

  const readyPlayerMeUserId = (await createReadyPlayerMeUser())?.id

  if (!readyPlayerMeUserId) {
    context.result = {
      readyPlayerMeUserId
    }
  }

  const accountCreated = await context.app.service(readyPlayerMeAccountPath).create({
    type: 'guest',
    readyPlayerMeUserId
  })

  context.result = accountCreated
  return context
}

export default {
  around: {
    all: [schemaHooks.resolveResult(readyPlayerMeAccountResolver)]
  },
  before: {
    all: [],
    find: [disallow('external')],
    get: [createAccountIfNotExists],
    create: [disallow('external'), schemaHooks.resolveData(readyPlayerMeAccountDatResolver)],
    update: [disallow()],
    patch: [
      schemaHooks.validateData(readyPlayerMeAccountDataValidator),
      schemaHooks.resolveData(readyPlayerMeAccountPatchResolver)
    ],
    remove: [disallow()]
  },
  after: {
    all: [],
    find: [],
    get: [],
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
