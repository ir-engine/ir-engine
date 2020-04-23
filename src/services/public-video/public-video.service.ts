import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { PublicVideo } from './public-video.class'
import createModel from '../../models/public-video.model'
import hooks from './public-video.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'public-video': PublicVideo & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: ['create']
  }

  app.use('/public-video', new PublicVideo(options, app))

  const service = app.service('public-video')

  service.hooks(hooks)
}
