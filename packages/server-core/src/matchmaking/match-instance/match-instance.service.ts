import { Application } from '../../../declarations'
import { MatchInstance } from './match-instance.class'
import matchTicketDocs from './match-instance.docs'
import hooks from './match-instance.hooks'
import createModel from './match-instance.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'match-instance': MatchInstance
  }
}

export default (app: Application): void => {
  /**
   * Initialize our service with any options it requires and docs
   */
  const s = new MatchInstance({ Model: createModel(app) }, app)
  s.docs = matchTicketDocs

  app.use('match-instance', s)

  const service = app.service('match-instance')

  service.hooks(hooks)
}
