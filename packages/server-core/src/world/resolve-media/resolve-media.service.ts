// Initializes the `resolve-media` service on path `/resolve-media`
import { Application } from '../../../declarations'
import { ResolveMedia } from './resolve-media.class'
import resolveMediaDocs from './resolve-media.docs'
import hooks from './resolve-media.hooks'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'resolve-media': ResolveMedia
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new ResolveMedia(options, app)
  event.docs = resolveMediaDocs
  app.use('resolve-media', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('resolve-media')

  service.hooks(hooks)
}
