import {
  matchTicketAssignmentMethods,
  matchTicketAssignmentPath
} from '@etherealengine/matchmaking/src/match-ticket-assignment.schema'

import { Application } from '../../../declarations'
import { MatchTicketAssignmentService } from './match-ticket-assignment.class'
import matchTicketAssignmentDocs from './match-ticket-assignment.docs'
import hooks from './match-ticket-assignment.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [matchTicketAssignmentPath]: MatchTicketAssignmentService
  }
}

export default (app: Application): void => {
  const options = {
    name: matchTicketAssignmentPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(matchTicketAssignmentPath, new MatchTicketAssignmentService(options, app), {
    // A list of all methods this service exposes externally
    methods: matchTicketAssignmentMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: matchTicketAssignmentDocs
  })

  const service = app.service(matchTicketAssignmentPath)
  service.hooks(hooks)
}
