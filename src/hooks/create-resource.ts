import { Hook, HookContext } from '@feathersjs/feathers'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    const { data } = context

    const resourceData = {
      name: data.name,
      description: data.description,
      url: data.url,
      mime_type: data.mime_type,
      metadata: data.metadata,
      attribution: data.attribution
    }

    context.app.service('resource').create(resourceData)
    return context
  }
}
