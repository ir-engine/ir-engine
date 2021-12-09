import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import { BadRequest, NotFound } from '@feathersjs/errors'
import { Application } from '../../../declarations'
import { createTicket, deleteTicket, getTicket } from '@xrengine/matchmaking/src/functions'
import { OpenMatchTicket } from '@xrengine/matchmaking/src/interfaces'
import config from '@xrengine/server-core/src/appconfig'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { emulate_createTicket, emulate_getTicket } from '../emulate'

interface Data {}

interface ServiceOptions {}

interface TicketParams {
  gamemode: string
}

function isValidTicketParams(data: unknown): data is TicketParams {
  const params = data as TicketParams
  return typeof params.gamemode !== 'undefined'
}

/**
 * A class for OpenMatch Tickets service
 *
 * @author Vyacheslav Solovjov
 */
export class MatchTicket implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  async find(params: Params): Promise<Data[]> {
    return []
  }

  async get(id: Id, params: Params): Promise<OpenMatchTicket> {
    const [dbServerConfig] = await this.app.service('server-setting').find()
    const serverConfig = dbServerConfig || config.server

    if (typeof id !== 'string' || id.length === 0) {
      throw new BadRequest('Invalid ticket id, not empty string is expected')
    }

    let ticket
    if (serverConfig.matchmakerEmulationMode) {
      // emulate response from open-match-api
      ticket = await emulate_getTicket(this.app, id, params.body.userId)
    } else {
      ticket = getTicket(String(id))
    }

    if (!ticket) {
      throw new NotFound()
    }
    return ticket as OpenMatchTicket
  }

  async create(data: unknown, params: Params): Promise<OpenMatchTicket | OpenMatchTicket[]> {
    const [dbServerConfig] = await this.app.service('server-setting').find()
    const serverConfig = dbServerConfig || config.server

    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current, params) as OpenMatchTicket))
    }

    if (!isValidTicketParams(data)) {
      // TODO: better validation response
      throw new BadRequest('Invalid ticket params')
    }

    if (serverConfig.matchmakerEmulationMode) {
      // emulate response from open-match-api
      return emulate_createTicket(data.gamemode)
    }

    return await createTicket(data.gamemode)
  }

  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
    // not implemented for tickets
    return data
  }

  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    // not implemented for tickets
    return data
  }

  async remove(id: Id, params: Params): Promise<Data> {
    // skip delete in emulation, user-match will be deleted in hook
    const [dbServerConfig] = await this.app.service('server-setting').find()
    const serverConfig = dbServerConfig || config.server

    if (!serverConfig.matchmakerEmulationMode) {
      await deleteTicket(String(id))
    }
    return { id }
  }
}
