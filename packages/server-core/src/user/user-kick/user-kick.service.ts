import { Application } from '../../../declarations'
import { UserKick } from './user-kick.class'
import hooks from './user-kick.hooks'
import createModel from './user-kick.model'

declare module '@etherealengine/common/declarations' {
  /**
   * Interface for user-kick
   */
  interface ServiceTypes {
    'user-kick': UserKick
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new UserKick(options, app)
  // event.docs = userKickDocs

  app.use('user-kick', event)

  const service = app.service('user-kick')

  service.hooks(hooks)
}
