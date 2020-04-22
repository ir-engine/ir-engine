import dauria from 'dauria'
import { Hook, HookContext } from '@feathersjs/feathers'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    if (context.data.uri) {
      delete context.data.uri
    }

    delete context.result.uri

    let storage = context.params.storageProvider.getStorage()

    let url = 'https://s3.amazonaws.com/' + storage.bucket + '/' + context.result.id

    context.data.url = url

    return context
  }
}
