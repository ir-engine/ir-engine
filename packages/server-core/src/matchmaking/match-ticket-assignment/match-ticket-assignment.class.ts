import { NotFound } from '@feathersjs/errors'
import { Id, Params } from '@feathersjs/feathers'
import { KnexAdapter, KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex/lib'

import { getTicketsAssignment } from '@etherealengine/matchmaking/src/functions'
import {
  MatchTicketAssignmentQuery,
  MatchTicketAssignmentType
} from '@etherealengine/matchmaking/src/match-ticket-assignment.schema'
import config from '@etherealengine/server-core/src/appconfig'

import { Application } from '../../../declarations'
import { emulate_getTicketsAssignment } from '../emulate'

export interface MatchTicketAssignmentParams extends KnexAdapterParams<MatchTicketAssignmentQuery> {
  userId?: string
}

/**
 * A class for MatchTicketAssignment service
 */
export class MatchTicketAssignmentService<
  T = MatchTicketAssignmentType,
  ServiceParams extends Params = MatchTicketAssignmentParams
> extends KnexAdapter<MatchTicketAssignmentType, MatchTicketAssignmentParams> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params: MatchTicketAssignmentParams) {
    let assignment: MatchTicketAssignmentType
    try {
      if (config.server.matchmakerEmulationMode) {
        assignment = await emulate_getTicketsAssignment(this.app, id, params['identity-provider'].userId)
      } else {
        assignment = await getTicketsAssignment(String(id))
      }
    } catch (e) {
      // todo: handle other errors. like no connection, etc....
      throw new NotFound(e.message, e)
    }

    return assignment
  }
}
