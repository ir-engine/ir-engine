import { HookContext } from '@feathersjs/feathers';
import config from '../config';
import StorageProvider from '../storage/storageprovider';

export default (options = {}) => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.params.thumbnailOwnedFileId) {
      // Fetch Key of the thumbnail file and use the key to remove from local-store or AWS S3
      const resource = await context.app
        .service('static-resource')
        .Model.findOne({
          where: {
            id: context.params.thumbnailOwnedFileId
          },
          attributes: ['key']
        });
      const storage = new StorageProvider().getStorage();
      // Remove previous thumbnail, no point in keeping it since client sends new thumbnail anyway
      storage.remove(
        {
          key: resource.key
        },
        (err: Error, result: any) => {
          if (err) {
            console.log('Storage provider:', config.server.storageProvider);
            console.error(
              'Error removing previous static resource before updating',
              err
            );
            return err;
          }
          console.log(
            'Successfully removed previous static resource before updating:',
            result
          );
        }
      );
    }
    return context;
  };
};
