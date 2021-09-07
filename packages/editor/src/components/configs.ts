import { Config } from '@xrengine/common/src/config'

/**
 * Read configs from meta tags if available, otherwise use the process.env injected from build.
 *
 * @author Robert Long
 * @param  (Object) Provides applcation configs.
 */
const configs = {
  name: (): string => 'Scene Editor',
  longName: (): string => 'Scene Editor',
  SERVER_URL: Config.publicRuntimeConfig.apiServer,
  APP_URL: Config.publicRuntimeConfig.appServer,
  FEATHERS_STORE_KEY: Config.publicRuntimeConfig.feathersStoreKey,
  ROOT_REDIRECT: Config.publicRuntimeConfig.rootRedirect
}

export default configs
