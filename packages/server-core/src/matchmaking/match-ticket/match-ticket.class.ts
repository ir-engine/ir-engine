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

import { BadRequest, NotFound } from '@feathersjs/errors'
import { Id, Params } from '@feathersjs/feathers'
import { KnexAdapter, KnexAdapterOptions } from '@feathersjs/knex/lib'

import { createTicket, deleteTicket, getTicket } from '@etherealengine/matchmaking/src/functions'
import { MatchTicketData, MatchTicketQuery, MatchTicketType } from '@etherealengine/matchmaking/src/match-ticket.schema'
import config from '@etherealengine/server-core/src/appconfig'

import { KnexAdapterParams } from '@feathersjs/knex'
import { Application } from '../../../declarations'
import { emulate_createTicket, emulate_getTicket } from '../emulate'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MatchTicketParams extends KnexAdapterParams<MatchTicketQuery> {}

/**
 * A class for MatchTicket service
 */
export class MatchTicketService<
  T = MatchTicketType,
  ServiceParams extends Params = MatchTicketParams
> extends KnexAdapter<MatchTicketType, MatchTicketData, MatchTicketParams> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params: MatchTicketParams): Promise<MatchTicketType> {
    if (typeof id !== 'string' || id.length === 0) {
      throw new BadRequest('Invalid ticket id, not empty string is expected')
    }

    let ticket
    if (config.server.matchmakerEmulationMode) {
      // emulate response from open-match-api
      ticket = await emulate_getTicket(this.app, id, params.user!.id)
    } else {
      ticket = getTicket(String(id))
    }

    if (!ticket) {
      throw new NotFound()
    }
    return ticket as MatchTicketType
  }

  async create(data: MatchTicketData) {
    if (config.server.matchmakerEmulationMode) {
      // emulate response from open-match-api
      return emulate_createTicket(data.gameMode)
    }

    return await createTicket(data.gameMode, data.attributes)
  }

  async remove(id: Id) {
    // skip delete in emulation, user-match will be deleted in hook
    if (!config.server.matchmakerEmulationMode) {
      await deleteTicket(String(id))
    }
    return { id }
  }
}
