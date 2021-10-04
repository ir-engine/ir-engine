import { Application } from '../../../declarations'
import { MediaSearch } from './media-search.class'
import mediaSearchDocs from './media-search.docs'
import hooks from './media-search.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    'media-search': MediaSearch
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
  const event = new MediaSearch(options, app)
  event.docs = mediaSearchDocs
  app.use('media-search', event)

  const service = app.service('media-search')

  service.hooks(hooks)
}
