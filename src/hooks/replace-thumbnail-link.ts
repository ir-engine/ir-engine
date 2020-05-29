import config from 'config'
import { Hook, HookContext } from '@feathersjs/feathers'
import uploadThumbnailLinkHook from './upload-thumbnail-link'
import StorageProvider from '../storage/storageprovider'
import _ from 'lodash'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { app, data, params } = context
    if (data.id) {
      const currentResource = await app.service('static-resource').get(data.id)
      currentResource.metadata = JSON.parse(currentResource.metadata)

      if (currentResource.metadata.thumbnail_url !== data.metadata.thumbnail_url && data.metadata.thumbnail_url != null && data.metadata.thumbnail_url.length > 0) {
        const existingThumbnails = await app.service('static-resource').find({
          query: {
            userId: params['identity-provider'].userId,
            parentResourceId: data.id,
            url: currentResource.metadata.thumbnail_url || ''
          }
        })

        await Promise.all(existingThumbnails.data.map(async (item: any) => {
          return app.service('static-resource').remove(item.id)
        }))
        params.parentResourceId = data.id
        params.uploadPath = data.url.replace('https://s3.amazonaws.com/' + (config.get('aws.s3.static_resource_bucket') as string) + '/', '')
        params.uploadPath = params.uploadPath.replace('/manifest.mpd', '')
        params.storageProvider = new StorageProvider()
        const contextClone = _.cloneDeep(context)
        const result = await uploadThumbnailLinkHook()(contextClone)
        data.metadata.thumbnail_url = (result as any).params.thumbnailUrl.replace('s3.amazonaws.com/' + (config.get('aws.s3.static_resource_bucket') as string), config.get('aws.cloudfront.domain'))
      }
    }

    return context
  }
}
