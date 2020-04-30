import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Party } from './party.class'
import createModel from '../../models/party.model'
import hooks from './party.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'party': Party & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    multi: true
  }

  app.use('/party', new Party(options, app))

  const service = app.service('party')

  service.hooks(hooks)
}
