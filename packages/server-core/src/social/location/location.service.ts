import { Application } from '../../../declarations'
import { Location } from './location.class'
import locationDocs from './location.docs'
import hooks from './location.hooks'
import createModel from './location.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    location: Location
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }
  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Location(options, app)
  event.docs = locationDocs

  app.use('location', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('location')

  service.hooks(hooks)
}
