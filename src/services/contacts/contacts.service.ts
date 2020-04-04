// Initializes the `contacts` service on path `/contacts`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Contacts } from './contacts.class'
import createModel from '../../models/contacts.model'
import hooks from './contacts.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'contacts': Contacts & ServiceAddons<any>
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  app.use('/contacts', new Contacts(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('contacts')

  service.hooks(hooks)
}
