// Initializes the `Avatars` service on path `/avatar`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Avatar } from './avatar.class'
import createModel from '../../models/avatar.model'
import hooks from './avatar.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'avatar': Avatar & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/avatar', new Avatar(options, app))

  const service = app.service('avatar')

  service.hooks(hooks)
}
