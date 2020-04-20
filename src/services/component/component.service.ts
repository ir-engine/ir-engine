// Initializes the `component` service on path `/component`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Component } from './component.class'
import createModel from '../../models/component.model'
import hooks from './component.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'component': Component & ServiceAddons<any>
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/component', new Component(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('component')

  service.hooks(hooks)
}
