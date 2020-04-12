// Initializes the `scene-object` service on path `/scene-object`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { SceneObjects } from './scene-object.class'
import createModel from '../../models/scene-object.model'
import hooks from './scene-object.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'scene-object': SceneObjects & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/scene-object', new SceneObjects(options, app))

  const service = app.service('scene-object')

  service.hooks(hooks)
}
