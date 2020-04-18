// Initializes the `GroupMember` service on path `/group-member`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { GroupMember } from './group-member.class';
import createModel from '../../models/group-member.model';
import hooks from './group-member.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'group-member': GroupMember & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/group-member', new GroupMember(options, app))

  // Get our initialized service so that we can register hooks
  const service = app.service('group-member')

  service.hooks(hooks)
}
