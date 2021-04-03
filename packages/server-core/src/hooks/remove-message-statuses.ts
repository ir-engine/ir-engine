import config from '../config';
import { Hook, HookContext } from '@feathersjs/feathers';
import StorageProvider from '../media/storageprovider/storageprovider';
import { StaticResource } from '../services/static-resource/static-resource.class';

export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app, id } = context;

    await app.service('message-status').Model.destroy({
      where: {
        messageId: id
      }
    });

    return context;
  };
};
