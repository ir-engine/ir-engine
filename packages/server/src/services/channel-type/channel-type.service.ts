import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ChannelType } from './channel-type.class';
import createModel from '../../models/channel-type.model';
import hooks from './channel-type.hooks';

declare module '../../declarations' {
  interface ServiceTypes {
    'channel-type': ChannelType & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/channel-type', new ChannelType(options, app));

  const service = app.service('channel-type');

  service.hooks(hooks);
};
