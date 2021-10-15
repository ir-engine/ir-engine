import hooks from './route.hooks'
import { Application } from '../../../declarations'
import { Route } from './route.class'
import createModel from './route.model'
import routeDocs from './route.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    route: Route
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Route(options, app)
  event.docs = routeDocs
  app.use('route', event)

  const service = app.service('route')

  service.hooks(hooks)
}
