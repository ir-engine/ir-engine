import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Asset } from './asset.class'
import createModel from '../../models/asset.model'
import hooks from './asset.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'asset': Asset & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true

  }

  app.use('/asset', new Asset(options, app))

  const service = app.service('asset')

  service.hooks(hooks)
}
