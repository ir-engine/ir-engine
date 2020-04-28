// Initializes the `sceneListing` service on path `/scene-listing`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { SceneListing } from './scene-listing.class'
import createModel from '../../models/scene-listing.model'
import hooks from './scene-listing.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'scene-listing': SceneListing & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/scene-listing', new SceneListing(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('scene-listing')

  service.hooks(hooks)
}
