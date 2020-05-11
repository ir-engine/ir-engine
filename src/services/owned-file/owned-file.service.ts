import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { OwnedFile } from './owned-file.class'
import createModel from '../../models/owned-file.model'
import hooks from './owned-file.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'owned-file': OwnedFile & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/owned-file', new OwnedFile(options, app))

  const service = app.service('owned-file')

  service.hooks(hooks)
}
