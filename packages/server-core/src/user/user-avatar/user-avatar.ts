import { userAvatarMethods, userAvatarPath } from '@etherealengine/engine/src/schemas/user/user-avatar.schema'

import { Application } from '@etherealengine/server-core/declarations'
import { UserAvatarService } from './user-avatar.class'
import userAvatarDocs from './user-avatar.docs'
import hooks from './user-avatar.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [userAvatarPath]: UserAvatarService
  }
}

export default (app: Application): void => {
  const options = {
    name: userAvatarPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(userAvatarPath, new UserAvatarService(options), {
    // A list of all methods this service exposes externally
    methods: userAvatarMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: userAvatarDocs
  })

  const service = app.service(userAvatarPath)
  service.hooks(hooks)
}
