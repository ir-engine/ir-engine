import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Video } from './video.class'
import hooks from './video.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'video': Video & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    multi: true
  }

  app.use('/video', new Video(options, app))

  const service = app.service('video')

  service.hooks(hooks)
}
