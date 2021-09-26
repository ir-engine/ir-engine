import { ServiceAddons } from '@feathersjs/feathers'
import hooks from './reality-pack.hooks'
import { Application } from '../../../declarations'
import { RealityPack } from './reality-pack.class'
import createModel from './reality-pack.model'
import realityPackDocs from './reality-pack.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'reality-pack': RealityPack & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new RealityPack(options, app)
  event.docs = realityPackDocs
  app.use('/reality-pack', event)

  const service = app.service('reality-pack')

  service.hooks(hooks as any)
}
