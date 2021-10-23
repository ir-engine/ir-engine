import { Application } from '../../../declarations'
import { SceneListing } from './scene-listing.class'
import createModel from './scene-listing.model'
import hooks from './scene-listing.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    'scene-listing': SceneListing
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
  app.use('scene-listing', new SceneListing(options, app))

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('scene-listing')

  service.hooks(hooks)
}
