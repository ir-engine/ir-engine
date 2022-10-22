import { AvatarInterface } from '@xrengine/common/src/dbmodels/AvatarResource'

import { Application } from '../../../declarations'
import { Avatar } from './avatar.class'
import avatarDocs from './avatar.docs'
import hooks from './avatar.hooks'
import createModel from './avatar.model'

declare module '@xrengine/common/declarations' {
  /**
   * Interface for users input
   */
  interface ServiceTypes {
    avatar: Avatar
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Avatar(options, app)
  event.docs = avatarDocs

  app.use('avatar', event)

  const service = app.service('avatar')

  service.hooks(hooks)
}
