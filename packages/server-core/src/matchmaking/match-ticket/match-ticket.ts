import { matchTicketMethods, matchTicketPath } from '@etherealengine/matchmaking/src/match-ticket.schema'

import { Application } from '../../../declarations'
import { MatchTicketService } from './match-ticket.class'
import matchTicketDocs from './match-ticket.docs'
import hooks from './match-ticket.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [matchTicketPath]: MatchTicketService
  }
}

export default (app: Application): void => {
  const options = {
    name: matchTicketPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(matchTicketPath, new MatchTicketService(options, app), {
    // A list of all methods this service exposes externally
    methods: matchTicketMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: matchTicketDocs
  })

  const service = app.service(matchTicketPath)
  service.hooks(hooks)
}
