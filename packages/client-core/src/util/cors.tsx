import { Config } from '@xrengine/common/src/config'

let corsAddress = ''
if (process.env.APP_ENV == 'development') {
  corsAddress = `https://${process.env.VITE_SERVER_HOST}:${process.env.VITE_CORS_SERVER_PORT}`
} else {
  corsAddress = `${Config.publicRuntimeConfig.apiServer}/cors-proxy/`
}

export const corsAnywhereUrl = (url) => {
  return `${corsAddress}/${url}`
}

export const isCorsAnywhereUrl = (url) => {
  return url.includes(corsAddress)
}

export const removeCorsAnywhereUrl = (url) => {
  return url.replace(corsAddress, '')
}
