// @ts-ignore
export const env = import.meta.env
globalThis.env = env

/**
 * Config settings (for client and isomorphic engine usage).
 */
const localBuildOrDev = env.APP_ENV === 'development' || env['VITE_LOCAL_BUILD'] === 'true'

export function validateEmail(email: string): boolean {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  return /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)
}

export const isDev = env.APP_ENV === 'development'

/**
 * Client / frontend
 */
const client = {
  appEnv: env.APP_ENV,
  nodeEnv: env.NODE_ENV,
  localNginx: env.VITE_LOCAL_NGINX,
  localBuild: env['VITE_LOCAL_BUILD'],
  localBuildOrDev,
  clientUrl:
    localBuildOrDev && env.VITE_LOCAL_NGINX !== 'true'
      ? `https://${env['VITE_APP_HOST']}:${env['VITE_APP_PORT']}`
      : `https://${env['VITE_APP_HOST']}`,
  serverHost: env['VITE_SERVER_HOST'],
  serverUrl:
    localBuildOrDev && env.VITE_LOCAL_NGINX !== 'true'
      ? `https://${env['VITE_SERVER_HOST']}:${env['VITE_SERVER_PORT']}`
      : `https://${env['VITE_SERVER_HOST']}`,
  instanceserverUrl:
    localBuildOrDev && env.VITE_LOCAL_NGINX !== 'true'
      ? `https://${env['VITE_INSTANCESERVER_HOST']}:${env['VITE_INSTANCESERVER_PORT']}`
      : `https://${env['VITE_INSTANCESERVER_HOST']}`,
  fileServer: env.VITE_FILE_SERVER,
  mediatorServer: env['VITE_MEDIATOR_SERVER'],
  cors: {
    proxyUrl:
      localBuildOrDev && env.VITE_LOCAL_NGINX !== 'true'
        ? `https://${env['VITE_SERVER_HOST']}:${env['VITE_CORS_SERVER_PORT']}`
        : `https://${env['VITE_SERVER_HOST']}/cors-proxy`,
    serverPort: env.VITE_CORS_SERVER_PORT
  },
  logs: {
    forceClientAggregate: env.VITE_FORCE_CLIENT_LOG_AGGREGATE,
    disabled: env.VITE_DISABLE_LOG
  },
  rootRedirect: env['VITE_ROOT_REDIRECT'],
  tosAddress: env['VITE_TERMS_OF_SERVICE_ADDRESS'],
  lobbyLocationName: env['VITE_LOBBY_LOCATION_NAME'],
  readyPlayerMeUrl: env['VITE_READY_PLAYER_ME_URL'],
  key8thWall: env.VITE_8TH_WALL!,
  featherStoreKey: env['VITE_FEATHERS_STORE_KEY'],
  gaMeasurementId: env['VITE_GA_MEASUREMENT_ID']
}

/**
 * Full config
 */
const config = {
  client
}

export default config
