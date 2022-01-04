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
  SERVER_URL: `https://${globalThis.process.env['VITE_SERVER_HOST']}`,
  APP_URL: `https://${globalThis.process.env['VITE_APP_HOST']}`,
  FEATHERS_STORE_KEY: `https://${globalThis.process.env['VITE_FEATHERS_STORE_KEY']}`,
  ROOT_REDIRECT: globalThis.process.env['VITE_ROOT_REDIRECT']
}

export default configs
