// Initializes the `XrScenes` service on path `/scenes`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { XrScenes } from './xr-scenes.class'
import createModel from '../../models/xr-scenes.model'
import hooks from './xr-scenes.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'scenes': XrScenes & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/scenes', new XrScenes(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('scenes')

  service.hooks(hooks)
}
