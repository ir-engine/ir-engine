export const hostDefined = !!globalThis.process.env['VITE_SERVER_HOST']
// TODO: Hate to dupe the two config vars below, would prefer to load them from @xrengine/client-core/src/utils/config
export const localBuildOrDev = process.env.APP_ENV === 'development' || process.env['VITE_LOCAL_BUILD'] === 'true'
export const serverHost = localBuildOrDev
  ? `https://${globalThis.process.env['VITE_SERVER_HOST']}:${globalThis.process.env['VITE_SERVER_PORT']}`
  : `https://${globalThis.process.env['VITE_SERVER_HOST']}`
