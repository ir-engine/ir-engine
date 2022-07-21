import { Application } from '../../../declarations'
import { MatchTicket } from './match-ticket.class'
import matchTicketDocs from './match-ticket.docs'
import hooks from './match-ticket.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'match-ticket': MatchTicket
  }
}

export default (app: Application): void => {
  /**
   * Initialize our service with any options it requires and docs
   */
  const s = new MatchTicket({}, app)
  s.docs = matchTicketDocs

  app.use('match-ticket', s)

  const service = app.service('match-ticket')

  service.hooks(hooks)
}
