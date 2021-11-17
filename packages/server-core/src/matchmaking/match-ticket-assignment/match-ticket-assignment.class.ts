import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import { BadRequest } from '@feathersjs/errors'
import { Application } from '../../../declarations'
import { getTicketsAssignment } from '@xrengine/matchmaking/src/functions'
import { OpenMatchTicketAssignment } from '@xrengine/matchmaking/src/interfaces'
import config from '../../appconfig'
import { emulate_getTicketsAssignment } from '../emulate'

interface Data {}

interface ServiceOptions {}

/**
 * A class for OpenMatch Tickets service
 *
 * @author Vyacheslav Solovjov
 */
export class MatchTicketAssignment implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  async find(params?: Params): Promise<Data[]> {
    return []
  }

  async get(ticketId: unknown, params?: Params): Promise<OpenMatchTicketAssignment> {
    if (typeof ticketId !== 'string' || ticketId.length === 0) {
      throw new BadRequest('Invalid ticket id, not empty string is expected')
    }

    if (config.server.matchmakerEmulationMode) {
      return emulate_getTicketsAssignment(this.app, ticketId, params['identity-provider'].userId)
    }

    return getTicketsAssignment(ticketId)
  }

  async create(data: unknown, params?: Params): Promise<Data> {
    return data
  }

  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    // not implemented for tickets
    return data
  }

  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    // not implemented for tickets
    return data
  }

  async remove(id: Id, params?: Params): Promise<Data> {
    return { id }
  }
}
