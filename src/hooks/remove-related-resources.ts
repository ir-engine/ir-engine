import config from 'config'
import { Hook, HookContext } from '@feathersjs/feathers'
import StorageProvider from '../storage/storageprovider'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const provider = new StorageProvider()
    const storage = provider.getStorage()

    const { app, id } = context

    const staticResourceResult = await app.services.staticResource.find({
      query: {
        id: id
      }
    })

    const staticResource = staticResourceResult.data[0]

    if (staticResource != null) {
      const storageRemovePromise = new Promise(function (resolve, reject) {
        const key = staticResource.url.replace('https://s3.amazonaws.com/' + (config.get('aws.s3.blob_bucket_name') as string) + '/', '')
        storage.remove({
          key: key
        }, (err: any, result: any) => {
          if (err) {
            console.log(err)
            reject(err)
          }

          resolve(result)
        })
      })

      const children = await app.services.staticResource.find({
        query: {
          staticResourceParentId: id
        }
      })

      const staticResourceChildrenRemovePromise = Promise.all(children.data.map(async (child: any) => {
        const staticResourceChildRemovePromise = app.services.staticResource.remove(null, {
          query: {
            resourceId: child.resourceId
          }
        })

        const staticResourceRemovePromise = app.services.staticResource.remove(child.staticResourceId)

        return await Promise.all([
          staticResourceChildRemovePromise,
          staticResourceRemovePromise,
          storageRemovePromise,
          staticResourceChildrenRemovePromise
        ])
      }))
    }
  }
}
