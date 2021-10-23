import { Application } from '../../../declarations'
import { PublicVideo } from './public-video.class'
import hooks from './public-video.hooks'
import staticResourceModel from '../static-resource/static-resource.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'public-video': PublicVideo
  }
}

export default (app: Application): void => {
  const options = {
    name: 'public-video',
    Model: staticResourceModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  app.use('public-video', new PublicVideo(options, app))

  const service = app.service('public-video')

  service.hooks(hooks)
}
