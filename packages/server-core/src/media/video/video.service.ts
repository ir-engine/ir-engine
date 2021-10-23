import { Application } from '../../../declarations'
import { Video } from './video.class'
import hooks from './video.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    video: Video
  }
}

export default (app: Application): void => {
  const options = {}

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  app.use('video', new Video(options, app))

  const service = app.service('video')

  service.hooks(hooks)
}
