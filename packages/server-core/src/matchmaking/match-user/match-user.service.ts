import { Application } from '../../../declarations'
import { MatchUser } from './match-user.class'
import hooks from './match-user.hooks'
import matchUserDocs from './match-user.docs'
import createModel from './match-user.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'match-user': MatchUser
  }
}

export default (app: Application): void => {
  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */

  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  const matchUserService = new MatchUser(options, app)
  matchUserService.docs = matchUserDocs

  app.use('match-user', matchUserService)

  const service = app.service('match-user')

  service.hooks(hooks)
}
