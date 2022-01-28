import { Application } from '../../../declarations'
import { MatchInstance } from './match-instance.class'
import hooks from './match-instance.hooks'
import matchTicketDocs from './match-instance.docs'
import createModel from './match-instance.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'match-instance': MatchInstance
  }
}

export default (app: Application): void => {
  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const s = new MatchInstance({ Model: createModel(app) }, app)
  s.docs = matchTicketDocs

  app.use('match-instance', s)

  const service = app.service('match-instance')

  service.hooks(hooks)
}
