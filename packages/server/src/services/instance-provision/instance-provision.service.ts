// Initializes the `instance-provision` service on path `/instance-provision`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { InstanceProvision } from './instance-provision.class';
import hooks from './instance-provision.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'instance-provision': InstanceProvision & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/instance-provision', new InstanceProvision(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('instance-provision');

  service.hooks(hooks);

  service.publish('created', async (data): Promise<any> => {
    try {
      console.log('Publishing instance-provision created to ' + data.userId);
      return app.channel(`userIds/${data.userId}`).send({
        ipAddress: data.ipAddress,
        port: data.port,
        locationId: data.locationId
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  });
};
