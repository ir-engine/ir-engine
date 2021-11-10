import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import { BadRequest, NotFound } from '@feathersjs/errors'
import { Application } from '../../../declarations'
// import { createTicket, deleteTicket, getTicket } from 'xrengine-matchmaking/src/functions'
import { createTicket, deleteTicket, getTicket } from '../../../../match-maker/src/functions'
import { OpenMatchTicket, OpenMatchTicketAssignment } from '../../../../match-maker/src/interfaces'

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

  async find(params?: Params): Promise<Data[]> {
    return []
  }

  async get(id: Id, params?: Params): Promise<OpenMatchTicket> {
    if (typeof id !== 'string' || id.length === 0) {
      throw new BadRequest('Invalid ticket id, not empty string is expected')
    }
    const ticket = getTicket(String(id))

    if (!ticket) {
      throw new NotFound()
    }
    return ticket as OpenMatchTicket
  }

  async create(data: unknown, params?: Params): Promise<OpenMatchTicket | OpenMatchTicket[]> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current, params) as OpenMatchTicket))
    }

    // TODO: handle duplicate tickets from same person?
    if (!isValidTicketParams(data)) {
      // TODO: better validation response
      throw new BadRequest('Invalid ticket params')
    }

    return await createTicket(data.gamemode)
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
    await deleteTicket(String(id))
    return { id }
  }
}
