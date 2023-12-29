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

import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, isProvider } from 'feathers-hooks-common'

import {
  MatchTicketData,
  MatchTicketType,
  matchSearchFieldsSchema,
  matchTicketDataSchema,
  matchTicketQuerySchema,
  matchTicketSchema
} from '@etherealengine/matchmaking/src/match-ticket.schema'
import matchmakingRemoveTicket from '@etherealengine/server-core/src/hooks/matchmaking-remove-ticket'
import matchmakingRestrictMultipleQueueing from '@etherealengine/server-core/src/hooks/matchmaking-restrict-multiple-queueing'
import matchmakingSaveTicket from '@etherealengine/server-core/src/hooks/matchmaking-save-ticket'
import setLoggedInUser from '@etherealengine/server-core/src/hooks/set-loggedin-user-in-body'

import { dataValidator, queryValidator } from '@etherealengine/engine/src/schemas/validators'
import { createTicket, deleteTicket, getTicket } from '@etherealengine/matchmaking/src/functions'
import { BadRequest, NotFound } from '@feathersjs/errors'
import { getValidator } from '@feathersjs/typebox'
import { HookContext } from '../../../declarations'
import config from '../../appconfig'
import disallowNonId from '../../hooks/disallow-non-id'
import { emulate_createTicket, emulate_getTicket } from '../emulate'
import { MatchTicketService } from './match-ticket.class'
import {
  matchTicketDataResolver,
  matchTicketExternalResolver,
  matchTicketQueryResolver,
  matchTicketResolver
} from './match-ticket.resolvers'

const matchSearchFieldsValidator = getValidator(matchSearchFieldsSchema, dataValidator)
const matchTicketValidator = getValidator(matchTicketSchema, dataValidator)
const matchTicketDataValidator = getValidator(matchTicketDataSchema, dataValidator)
const matchTicketQueryValidator = getValidator(matchTicketQuerySchema, queryValidator)

const getEmulationTicket = async (context: HookContext<MatchTicketService>) => {
  let ticket
  if (config.server.matchmakerEmulationMode) {
    // emulate response from open-match-api
    ticket = await emulate_getTicket(context.service, context.id, context.params.user!.id)
  } else {
    ticket = getTicket(String(context.id!))
  }

  if (!ticket) {
    throw new NotFound()
  }
  context.result = ticket as MatchTicketType
}

const createInEmulation = async (context: HookContext<MatchTicketService>) => {
  if (!context.data || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const data: MatchTicketData[] = Array.isArray(context.data) ? context.data : [context.data]
  const result: MatchTicketType[] = []

  for (const item of data) {
    if (config.server.matchmakerEmulationMode) {
      // emulate response from open-match-api
      return emulate_createTicket(item.gameMode)
    }

    result.push(await createTicket(item.gameMode, item.attributes))
  }
  context.result = result
}

const skipDeleteInEmulation = async (context: HookContext<MatchTicketService>) => {
  if (!config.server.matchmakerEmulationMode) {
    await deleteTicket(String(context.id))
  }

  context.result = undefined
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(matchTicketExternalResolver), schemaHooks.resolveResult(matchTicketResolver)]
  },

  before: {
    all: [
      () => schemaHooks.validateQuery(matchTicketQueryValidator),
      schemaHooks.resolveQuery(matchTicketQueryResolver)
    ],
    find: [],
    get: [iff(isProvider('external'), setLoggedInUser('userId') as any), disallowNonId, getEmulationTicket],
    create: [
      iff(isProvider('external'), setLoggedInUser('userId') as any),
      matchmakingRestrictMultipleQueueing(),
      // addUUID(),
      () => schemaHooks.validateData(matchTicketDataValidator),
      schemaHooks.resolveData(matchTicketDataResolver),
      createInEmulation
    ],
    update: [disallow()],
    patch: [disallow()],
    remove: [iff(isProvider('external')), skipDeleteInEmulation]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [matchmakingSaveTicket()],
    update: [],
    patch: [],
    remove: [matchmakingRemoveTicket()]
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
