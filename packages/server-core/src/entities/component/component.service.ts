import { Application } from '../../../declarations'
import { Component } from './component.class'
import createModel from './component.model'
import hooks from './component.hooks'
import componentDocs from './component.docs'
import { getAllPortals, getPortal, getCubemapBake } from './portal.controller'

declare module '../../../declarations' {
  interface ServiceTypes {
    component: Component
  }
  interface Models {
    component: ReturnType<typeof createModel>
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
  const event = new Component(options, app)
  event.docs = componentDocs
  app.use('component', event)

  app.get('/portal/list', getAllPortals(app))
  app.get('/portal/:entityId', getPortal(app))
  app.get('/cubemap/:entityId', getCubemapBake(app))

  const service = app.service('component')

  service.hooks(hooks)
}
