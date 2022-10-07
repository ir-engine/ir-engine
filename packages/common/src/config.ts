/**
 * Config settings (for client and isomorphic engine usage).
 */
export const localBuildOrDev = process.env.APP_ENV === 'development' || process.env['VITE_LOCAL_BUILD'] === 'true'

export const clientHost =
  localBuildOrDev && process.env.VITE_LOCAL_NGINX !== 'true'
    ? `https://${globalThis.process.env['VITE_APP_HOST']}:${globalThis.process.env['VITE_APP_PORT']}`
    : `https://${globalThis.process.env['VITE_APP_HOST']}`

export const serverHost =
  localBuildOrDev && process.env.VITE_LOCAL_NGINX !== 'true'
    ? `https://${globalThis.process.env['VITE_SERVER_HOST']}:${globalThis.process.env['VITE_SERVER_PORT']}`
    : `https://${globalThis.process.env['VITE_SERVER_HOST']}`

export const hostDefined = !!globalThis.process.env['VITE_SERVER_HOST']

export const instanceserverHost =
  localBuildOrDev && process.env.VITE_LOCAL_NGINX !== 'true'
    ? `https://${globalThis.process.env['VITE_INSTANCESERVER_HOST']}:${globalThis.process.env['VITE_INSTANCESERVER_PORT']}`
    : `https://${globalThis.process.env['VITE_INSTANCESERVER_HOST']}`

export const corsProxyPath =
  localBuildOrDev && process.env.VITE_LOCAL_NGINX !== 'true'
    ? `https://${process.env['VITE_SERVER_HOST']}:${process.env['VITE_CORS_SERVER_PORT']}`
    : `https://${process.env['VITE_SERVER_HOST']}/cors-proxy`

export function validateEmail(email: string): boolean {
  return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  return /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)
}
