import { Hook, HookContext } from '@feathersjs/feathers'

import getBasicMimetype from '../util/get-basic-mimetype'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { data, params } = context
    const body = params.body || {}

    const resourceData = {
      name: data.name || body.name || context.params.file.originalname,
      description: data.description || body.description,
      url: data.uri || data.url,
      mimeType: data.mimeType || params.mimeType,
      metadata: data.metadata || body.metadata,
      staticResourceType: 'data',
      userId: data.userId || body.userId || params.userId || null
    }
    resourceData.staticResourceType =
      data.type === 'user-thumbnail' || body.type === 'user-thumbnail'
        ? 'user-thumbnail'
        : getBasicMimetype(resourceData.mimeType)
    if (context.params.skipResourceCreation === true) {
      context.result = await context.app.service('static-resource').patch(context.params.patchId, {
        url: resourceData.url,
        metadata: resourceData.metadata,
        staticResourceType: resourceData.staticResourceType
      })
    } else {
      if (context.params.parentResourceId) {
        ;(resourceData as any).parentResourceId = context.params.parentResourceId
      }
      if (context.params.uuid && context.params.parentResourceId == null) {
        ;(resourceData as any).id = context.params.uuid
      }

      if (resourceData.staticResourceType === 'user-thumbnail') {
        const existingThumbnails = await context.app.service('static-resource').find({
          query: {
            userId: body.userId,
            staticResourceType: 'user-thumbnail'
          }
        })

        await Promise.all(
          existingThumbnails.data.map(async (item: any) => {
            return context.app.service('static-resource').remove(item.id)
          })
        )
        ;(resourceData as any).userId = body.userId
      }
      context.result = await context.app.service('static-resource').create(resourceData)
    }

    return context
  }
}
