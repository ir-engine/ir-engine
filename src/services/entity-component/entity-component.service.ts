import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { EntityComponent } from './entity-component.class'
import createModel from '../../models/entity-component.model'
import hooks from './entity-component.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'entity-component': EntityComponent & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/entity-component', new EntityComponent(options, app))

  const service = app.service('entity-component')

  service.hooks(hooks)
}
