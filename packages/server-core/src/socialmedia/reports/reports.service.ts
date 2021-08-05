/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
// Initializes the `reports` service on path `/reports`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { Reports } from './reports.class'
import createModel from './reports.model'
import hooks from './reports.hooks'
import reportsDocs from './reports.docs'

// const reports = '';
// // conts Feeds = '';

// Add this service to the service type index

declare module '../../../declarations' {
  interface ServiceTypes {
    reports: Reports & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  const reports = new Reports(options, app)
  reports.docs = reportsDocs
  app.use('/reports', reports)

  // Get our initialized service so that we can register hooks
  const service = app.service('reports')

  service.hooks(hooks as any)
}
