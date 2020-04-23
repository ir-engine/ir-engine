import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Magiclink } from './magiclink.class'
import hooks from './magiclink.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'magiclink': Magiclink & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate')
  }

  app.use('/magiclink', new Magiclink(options, app))

  const service = app.service('magiclink')

  service.hooks(hooks)
}
