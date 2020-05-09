// Initializes the `video` service on path `/video`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Video } from './video.class'
import hooks from './video.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'video': Video & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    multi: true
  }

  // Initialize our service with any options it requires
  app.use('/video', new Video(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('video')

  service.hooks(hooks)
}
