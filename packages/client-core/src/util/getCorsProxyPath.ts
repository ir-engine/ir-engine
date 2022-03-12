export const corsProxyPath =
  process.env.APP_ENV === 'development' || process.env['VITE_LOCAL_BUILD'] === 'true'
    ? `https://${process.env['VITE_SERVER_HOST']}:${process.env['VITE_CORS_SERVER_PORT']}`
    : `https://${process.env['VITE_SERVER_HOST']}/cors-proxy`
