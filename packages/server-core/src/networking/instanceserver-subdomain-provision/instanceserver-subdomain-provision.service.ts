// Initializes the `instanceserver-subdomain-provision` service on path `/instanceserver-subdomain-provision`
import { Application } from '../../../declarations'
import { InstanceserverSubdomainProvision } from './instanceserver-subdomain-provision.class'
import instanceServerSubdomainProvisionDocs from './instanceserver-subdomain-provision.docs'
import hooks from './instanceserver-subdomain-provision.hooks'
import createModel from './instanceserver-subdomain-provision.model'

// Add this service to the service type index
declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'instanceserver-subdomain-provision': InstanceserverSubdomainProvision
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new InstanceserverSubdomainProvision(options, app)
  event.docs = instanceServerSubdomainProvisionDocs
  app.use('instanceserver-subdomain-provision', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('instanceserver-subdomain-provision')

  service.hooks(hooks)
}
