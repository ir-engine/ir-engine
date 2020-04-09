// Initializes the `authmanagement` service on path `/authmanagement`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Authmanagement } from './auth-management.class'
import notifier from './notifier'
import hooks from './auth-management.hooks'
import authManagement from 'feathers-authentication-management'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'authManagement': Authmanagement & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  app.configure(authManagement(notifier(app)))

  // Get our initialized service so that we can register hooks
  const service = app.service('authManagement')
  service.hooks(hooks)
}
