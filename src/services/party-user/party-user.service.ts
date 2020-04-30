import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { PartyUser } from './party-user.class'
import createModel from '../../models/party-user.model'
import hooks from './party-user.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'party-user': PartyUser & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/party-user', new PartyUser(options, app))

  const service = app.service('party-user')

  service.hooks(hooks)
}
