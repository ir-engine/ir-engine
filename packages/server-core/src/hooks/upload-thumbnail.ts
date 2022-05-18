import { Hook, HookContext } from '@feathersjs/feathers'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    const { app } = context
    if (context.params.thumbnail) {
      context.params.file = context.params.thumbnail
      context.params.mimeType = context.params.file.mimetype
      context.params.parentResourceId = context.result.id
      context.data.metadata = context.data.metadata ? context.data.metadata : {}
      delete context.params.thumbnail

      await app.services.upload.create(context.data, context.params)

      return context
    } else {
      return context
    }
  }
}
