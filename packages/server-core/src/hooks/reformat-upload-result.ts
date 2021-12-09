import config from '../appconfig'
import { Hook, HookContext } from '@feathersjs/feathers'

export default (): Hook => {
  return async (context: HookContext): Promise<HookContext> => {
    if (context.data.uri) {
      delete context.data.uri
    }

    delete context.result.uri

    const [dbServerConfig] = await context.app.service('server-setting').find()
    const serverConfig = dbServerConfig || config.server

    const [dbAwsConfig] = await context.app.service('aws-setting').find()
    const awsConfig = dbAwsConfig || config.aws

    const domain =
      serverConfig.storageProvider === 'aws' ? awsConfig.cloudfront.domain : serverConfig.localStorageProvider

    const url = `https://${domain}/${context.result.id || context.data.id}`

    context.data.url = url

    return context
  }
}
