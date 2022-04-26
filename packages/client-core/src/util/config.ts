export const localBuildOrDev = process.env.APP_ENV === 'development' || process.env['VITE_LOCAL_BUILD'] === 'true'

export const serverHost = localBuildOrDev
  ? `https://${globalThis.process.env['VITE_SERVER_HOST']}:${globalThis.process.env['VITE_SERVER_PORT']}`
  : `https://${globalThis.process.env['VITE_SERVER_HOST']}`

export const gameserverHost = localBuildOrDev
  ? `https://${globalThis.process.env['VITE_GAMESERVER_HOST']}:${globalThis.process.env['VITE_GAMESERVER_PORT']}`
  : `https://${globalThis.process.env['VITE_GAMESERVER_HOST']}`

export const corsProxyPath = localBuildOrDev
  ? `https://${process.env['VITE_SERVER_HOST']}:${process.env['VITE_CORS_SERVER_PORT']}`
  : `https://${process.env['VITE_SERVER_HOST']}/cors-proxy`
