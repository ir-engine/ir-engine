import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Organization } from './organization.class'
import createModel from '../../models/organization.model'
import hooks from './organization.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'organization': Organization & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/organization', new Organization(options, app))

  const service = app.service('organization')

  service.hooks(hooks)
}
