import config from '../config';
import { Hook, HookContext } from '@feathersjs/feathers';
import StorageProvider from '../storage/storageprovider';
import { StaticResource } from '../services/static-resource/static-resource.class';
import logger from '../app/logger';


const getAllChildren = async (service: StaticResource, id: string | number | undefined, $skip: number): Promise<Record<string, any>[]> => {
  const pageResult = (await service.find({
    query: {
      parentResourceId: id,
      $skip: $skip
    }
  })) as any;

  const total = pageResult.total;
  let data = pageResult.data;
  const limit = pageResult.limit;
  if ($skip + (data.length as number) < total) {
    const nextPageData = await getAllChildren(service, id, $skip + (limit as number));

    data = data.concat(nextPageData);

    return data;
  } else {
    return data;
  }
};

export default (options = {}): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const provider = new StorageProvider();
    const storage = provider.getStorage();

    const { app, id } = context;
    if (id) {
      const staticResourceService = app.service('static-resource');

      const staticResourceResult = await staticResourceService.find({
        query: {
          id: id
        }
      });

      const staticResource = staticResourceResult.data[0];

      const storageRemovePromise = new Promise((resolve, reject) => {
        if (staticResource.url && staticResource.url.length > 0) {
          const key = staticResource.url.replace('https://' +
            config.aws.cloudfront.domain + '/', '');

          if (storage === undefined) {
            reject(new Error('Storage is undefined'));
          }

          storage.remove({
            key: key
          }, (err: any, result: any) => {
            if (err) {
              logger.error('Storage removal error');
              logger.error(err);
              reject(err);
            }

            resolve(result);
          });
        } else {
          resolve();
        }
      });

      const children = await getAllChildren(staticResourceService, id, 0);

      const childRemovalPromises = children.map(async (child: any) => {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises, no-async-promise-executor
        return await new Promise(async (resolve, reject) => {
          try {
            await staticResourceService.remove(child.id);
          } catch (err) {
            logger.error('Failed to remove child:', child.id);
            logger.error(err);
            reject(err);
          }

          resolve();
        });
      });

      const attributionRemovePromise = staticResource.attributionId
        ? app.service('attribution').remove(staticResource.attributionId)
        : Promise.resolve();

      const staticResourceChildrenRemovePromise = Promise.all(childRemovalPromises);

      await Promise.all([
        storageRemovePromise,
        staticResourceChildrenRemovePromise,
        attributionRemovePromise
      ]);
    }

    return context;
  };
};

