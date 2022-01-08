import { Application } from '../../../declarations'
import { MatchTicketAssignment } from './match-ticket-assignment.class'
import docs from './match-ticket-assignment.docs'
import hooks from './match-ticket-assignment.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    'match-ticket-assignment': MatchTicketAssignment
  }
}

export default (app: Application): void => {
  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const s = new MatchTicketAssignment({}, app)
  s.docs = docs

  app.use('match-ticket-assignment', s)

  const service = app.service('match-ticket-assignment')

  service.hooks(hooks)
}
