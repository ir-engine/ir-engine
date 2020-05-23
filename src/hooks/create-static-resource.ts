import { Hook, HookContext } from '@feathersjs/feathers'
import getBasicMimetype from '../util/get-basic-mimetype'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { data, params } = context
    const body = params.body || {}

    const resourceData = {
      name: data.name || body.name || context.params.file.originalname,
      description: data.description || body.description,
      url: data.uri || data.url,
      mime_type: data.mime_type || params.mime_type,
      metadata: data.metadata || body.metadata,
      staticResourceType: 'data'
    }
    resourceData.staticResourceType = data.type === 'user-thumbnail' || body.type === 'user-thumbnail'
      ? 'user-thumbnail'
      : getBasicMimetype(resourceData.mime_type)
    if (context.params.skipResourceCreation === true) {
      context.result = await context.app.service('static-resource').patch(context.params.patchId, {
        url: resourceData.url,
        metadata: resourceData.metadata
      })
    } else {
      if (context.params.parentResourceId) {
        (resourceData as any).parentResourceId = context.params.parentResourceId
      }
      if (context.params.uuid && context.params.parentResourceId == null) {
        (resourceData as any).id = context.params.uuid
      }

      if (resourceData.staticResourceType === 'user-thumbnail') {
        const existingThumbnails = await context.app.service('static-resource').find({
          query: {
            userId: body.userId,
            type: 'user-thumbnail'
          }
        })

        await Promise.all(existingThumbnails.data.map(async (item: any) => {
          return context.app.service('static-resource').remove(item.id)
        }));

        (resourceData as any).userId = body.userId
      }
      context.result = await context.app.service('static-resource').create(resourceData)
    }

    return context
  }
}
