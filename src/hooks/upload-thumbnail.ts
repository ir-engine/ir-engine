import { Hook, HookContext } from '@feathersjs/feathers'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    let { app } = context
    if (context.params.thumbnail) {
      context.params.file = context.params.thumbnail
      context.params.mime_type = context.params.file.mimetype
      delete context.params.thumbnail

      let result = await app.services.upload.create(context.data, context.params)

      await app.services['resource-type'].create({
        resource: result.id,
        type: 'thumbnail',
        resourceId: result.id
      })

      await app.services['resource-child'].create({
        resourceParent: context.result.id,
        resourceId: result.id
      })

      return context
  }
    else {
      return context
    }
  }
}
