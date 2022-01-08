import { Hook, HookContext } from '@feathersjs/feathers'

import config from '../appconfig'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.data.uri) {
      delete context.data.uri
    }

    delete context.result.uri

    const domain =
      config.server.storageProvider === 'aws' ? config.aws.cloudfront.domain : config.server.localStorageProvider

    const url = `https://${domain}/${context.result.id || context.data.id}`

    context.data.url = url

    return context
  }
}
