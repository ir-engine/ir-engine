// Initializes the `public-video` service on path `/public-video`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { PublicVideo } from './public-video.class'
import hooks from './public-video.hooks'
import resourceModel from '../../models/resource.model'
import createService from 'feathers-sequelize'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'public-video': PublicVideo & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    name: 'public-video',
    Model: resourceModel(app),
    paginate: app.get('paginate'),
    multi: ['create']
  }

  // Initialize our service with any options it requires
  app.use('/public-video', createService(options))

  // Get our initialized service so that we can register hooks
  const service = app.service('public-video')

  service.hooks(hooks)
}
