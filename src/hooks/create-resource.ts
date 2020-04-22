import { Hook, HookContext } from '@feathersjs/feathers'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { data, params } = context
    let body = params.body || {}

    const resourceData = {
      name: data.name || body.name,
      description: data.description || body.description,
      url: data.uri || data.url,
      mime_type: data.mime_type || params.mime_type,
      metadata: data.metadata || body.metadata
    }

    context.result = await context.app.service('resource').create(resourceData)

    console.log(context.result)

    return context
  }
}
