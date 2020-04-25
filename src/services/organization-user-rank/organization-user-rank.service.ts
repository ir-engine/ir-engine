// Initializes the `OrganizationUserRank` service on path `/organization-user-rank`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { OrganizationUserRank } from './organization-user-rank.class'
import createModel from '../../models/organization-user-rank.model'
import hooks from './organization-user-rank.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'organization-user-rank': OrganizationUserRank & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/organization-user-rank', new OrganizationUserRank(options, app))

  const service = app.service('organization-user-rank')

  service.hooks(hooks)
}
