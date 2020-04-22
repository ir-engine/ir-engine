import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Attribution } from './attribution.class'
import createModel from '../../models/attribution.model'
import hooks from './attribution.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'attribution': Attribution & ServiceAddons<any>
  }
}

export default function (app: Application): any {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/attribution', new Attribution(options, app))

  const service = app.service('attribution')

  service.hooks(hooks)
}
