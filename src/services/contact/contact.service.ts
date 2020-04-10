// Initializes the `contact` service on path `/contact`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Contact } from './contact.class'
import createModel from '../../models/contact.model'
import hooks from './contact.hooks'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'contact': Contact & ServiceAddons<any>
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  app.use('/contact', new Contact(options, app))

  const service = app.service('contact')

  service.hooks(hooks)
}
