import { Config } from '../../../helper'

/**
 * Read configs from meta tags if available, otherwise use the process.env injected from build.
 *
 * @author Robert Long
 * @param  (Object) Provides applcation configs.
 */
const configs = {}
const get = (configs, key, defaultValue) => {
  // @ts-ignore
  if (!process.browser) {
    return
  }
  const el = document.querySelector(`meta[name='env:${key.toLowerCase()}']`)
  if (el) {
    configs[key] = el.getAttribute('content')
  } else {
    configs[key] = defaultValue
  }
}

get(configs, 'GA_TRACKING_ID', process.env.VITE_GA_TRACKING_ID)
get(configs, 'SENTRY_DSN', process.env.VITE_SENTRY_DSN)
;(configs as any).name = (): string => 'Scene Editor'
;(configs as any).longName = (): string => 'Scene Editor'
;(configs as any).SERVER_URL = Config.publicRuntimeConfig.apiServer
;(configs as any).APP_URL = Config.publicRuntimeConfig.appServer
;(configs as any).FEATHERS_STORE_KEY = Config.publicRuntimeConfig.feathersStoreKey
;(configs as any).ROOT_REDIRECT = Config.publicRuntimeConfig.rootRedirect

export default configs
