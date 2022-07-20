import { Application } from '../../../declarations'
import { Magiclink } from './magic-link.class'
import magicLinkDocs from './magic-link.docs'
import hooks from './magic-link.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'magic-link': Magiclink
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Magiclink(options, app)
  event.docs = magicLinkDocs
  app.use('magic-link', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('magic-link')

  service.hooks(hooks)
}
