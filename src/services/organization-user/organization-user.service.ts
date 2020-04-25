import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { OrganizationUser } from './organization-user.class'
import createModel from '../../models/organization-user.model'
import hooks from './organization-user.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'organization-user': OrganizationUser & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/organization-user', new OrganizationUser(options, app))

  const service = app.service('organization-user')

  service.hooks(hooks)
}
