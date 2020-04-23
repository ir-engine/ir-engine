import config from 'config'
import { Hook, HookContext } from '@feathersjs/feathers'
import StorageProvider from '../storage/storageprovider'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const provider = new StorageProvider()
    const storage = provider.getStorage()

    const { app, id } = context

    console.log(app.services['resource-child'])

    const resourceResult = await app.services.resource.find({
      query: {
        id: id
      }
    })

    const resource = resourceResult.data[0]

    if (resource != null) {
      const storageRemovePromise = new Promise(function (resolve, reject) {
        const key = resource.url.replace('https://s3.amazonaws.com/' + (config.get('aws.s3.blob_bucket_name') as string) + '/', '')
        storage.remove({
          key: key
        }, function (err: any, result: any) {
          if (err) {
            console.log(err)
            reject(err)
          }

          resolve(result)
        })
      })

      const children = await app.services['resource-child'].find({
        query: {
          resourceParent: id
        }
      })

      const resourceChildrenRemovePromise = Promise.all(children.data.map(async function (child: any) {
        const resourceChildRemovePromise = app.services['resource-child'].remove(null, {
          query: {
            resourceId: child.resourceId
          }
        })

        const resourceRemovePromise = app.services.resource.remove(child.resourceId)

        return await Promise.all([
          resourceChildRemovePromise,
          resourceRemovePromise
        ])
      }))

      const resourceTypeRemovePromise = app.services['resource-type'].remove(null, {
        query: {
          resourceId: id
        }
      })

      await Promise.all([
        storageRemovePromise,
        resourceChildrenRemovePromise,
        resourceTypeRemovePromise
      ])
    }

    return context
  }
}
