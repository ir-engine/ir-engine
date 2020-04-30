import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { GroupUser } from './group-user.class'
import createModel from '../../models/group-user.model'
import hooks from './group-user.hooks'

declare module '../../declarations' {
  interface ServiceTypes {
    'group-user': GroupUser & ServiceAddons<any>
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  app.use('/group-user', new GroupUser(options, app))

  const service = app.service('group-user')

  service.hooks(hooks)
}
