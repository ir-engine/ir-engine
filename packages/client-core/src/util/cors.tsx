import { Config } from '@xrengine/common/src/config'

export const corsAnywhereUrl = (url) => {
  return `${Config.publicRuntimeConfig.corsServer}/${url}`
}

export const isCorsAnywhereUrl = (url) => {
  return url.includes(Config.publicRuntimeConfig.corsServer)
}

export const removeCorsAnywhereUrl = (url) => {
  return url.replace(Config.publicRuntimeConfig.corsServer, '')
}
