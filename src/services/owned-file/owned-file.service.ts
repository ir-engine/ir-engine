// Initializes the `OwnedFile` service on path `/owned-file`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { OwnedFile } from './owned-file.class'
import createModel from '../../models/owned-file.model'
import hooks from './owned-file.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'owned-file': OwnedFile & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/owned-file', new OwnedFile(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('owned-file')

  service.hooks(hooks)
}
