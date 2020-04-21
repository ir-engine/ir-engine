// Initializes the `relationship-type` service on path `/relationship-type`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { RelationshipType } from './relationship-type.class';
import createModel from '../../models/relationship-type.model';
import hooks from './relationship-type.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'relationship-type': RelationshipType & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/relationship-type', new RelationshipType(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('relationship-type');

  service.hooks(hooks);
}
