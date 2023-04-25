import { BadRequest, NotFound } from '@feathersjs/errors'
import { Id, Params } from '@feathersjs/feathers'
import { KnexAdapter, KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex/lib'

import { createTicket, deleteTicket, getTicket } from '@etherealengine/matchmaking/src/functions'
import { MatchTicketData, MatchTicketQuery, MatchTicketType } from '@etherealengine/matchmaking/src/match-ticket.schema'
import config from '@etherealengine/server-core/src/appconfig'

import { Application } from '../../../declarations'
import { emulate_createTicket, emulate_getTicket } from '../emulate'

export interface MatchTicketParams extends KnexAdapterParams<MatchTicketQuery> {
  userId?: string
}

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
      ticket = await emulate_getTicket(this.app, id, params.userId)
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
      return emulate_createTicket(data.gamemode)
    }

    return await createTicket(data.gamemode, data.attributes)
  }

  async remove(id: Id) {
    // skip delete in emulation, user-match will be deleted in hook
    if (!config.server.matchmakerEmulationMode) {
      await deleteTicket(String(id))
    }
    return { id }
  }
}
