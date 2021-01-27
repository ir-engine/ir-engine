// Initializes the `rtc-ports` service on path `/rtc-ports`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { RtcPorts } from './rtc-ports.class';
import createModel from '../../models/rtc-ports.model';
import hooks from './rtc-ports.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'rtc-ports': RtcPorts & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/rtc-ports', new RtcPorts(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('rtc-ports');

  service.hooks(hooks);
};
