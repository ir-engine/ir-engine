// Initializes the `XrAvatars` service on path `/avatars`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { XrAvatars } from './xravatars.class'
import createModel from '../../models/xravatars.model'
import hooks from './xravatars.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'avatars': XrAvatars & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/avatars', new XrAvatars(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('avatars')

  service.hooks(hooks)
}
