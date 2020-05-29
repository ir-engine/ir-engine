import config from 'config'
import { Hook, HookContext } from '@feathersjs/feathers'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    if (context.data.uri) {
      delete context.data.uri
    }

    delete context.result.uri

    const url = 'https://' + (config.get('aws.cloudfront.domain') as string) + '/' + (context.result.id as string || context.data.id as string)

    context.data.url = url

    return context
  }
}
