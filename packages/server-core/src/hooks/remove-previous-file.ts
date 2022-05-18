import { HookContext } from '@feathersjs/feathers'

import config from '../appconfig'
import logger from '../logger'
import { getStorageProvider } from '../media/storageprovider/storageprovider'
import { Application } from './../../declarations.d'

export default () => {
  return async (context: HookContext<Application>): Promise<HookContext> => {
    if (context.params.previousFileId) {
      // Fetch Key of the thumbnail file and use the key to remove from local-store or AWS S3
      const resource = await context.app.service('static-resource').Model.findOne({
        where: {
          id: context.params.previousFileId
        },
        attributes: ['key']
      })
      const storage = getStorageProvider().getStorage()
      // Remove previous thumbnail, no point in keeping it since client sends new thumbnail anyway
      storage.remove(
        {
          key: resource.key
        },
        (err: Error, result: any) => {
          if (err) {
            logger.error(
              err,
              'Error removing previous static resource before updating ' +
                `storage provider "${config.server.storageProvider}": ${err.message}`
            )
            return err
          }
          logger.info('Successfully removed previous static resource before updating:', result)
        }
      )
    }
    return context
  }
}
