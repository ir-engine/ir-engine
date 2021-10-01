import appRootPath from 'app-root-path'
import path from 'path'
import url from 'url'

const kubernetesEnabled = process.env.KUBERNETES === 'true'

const server = {
  enabled: process.env.SERVER_ENABLED === 'true',
  mode: process.env.SERVER_MODE,
  hostname: process.env.SERVER_HOST,
  port: process.env.SERVER_PORT,
  clientHost: process.env.APP_HOST,
  rootDirectory: path.resolve(appRootPath.path, 'packages', 'server'),
  publicDirectory:
    process.env.SERVER_PUBLIC_DIR ||
    (process.env.BUILD_MODE === 'individual'
      ? path.resolve(appRootPath.path, 'public')
      : path.resolve(appRootPath.path, 'packages', 'server', 'public')),
  nodeModulesDirectory: path.resolve(__dirname, '../..', 'node_modules'),
  localStorageProvider: process.env.LOCAL_STORAGE_PROVIDER,
  performDryRun: process.env.PERFORM_DRY_RUN === 'true',
  storageProvider: process.env.STORAGE_PROVIDER,
  gaTrackingId: process.env.GOOGLE_ANALYTICS_TRACKING_ID || null,
  hub: JSON.stringify({
    endpoint: process.env.HUB_ENDPOINT
  }),
  paginate: 100,
  url: '' || null,
  certPath: appRootPath.path.toString() + '/' + process.env.CERT,
  keyPath: appRootPath.path.toString() + '/' + process.env.KEY,
  local: process.env.LOCAL === 'true',
  releaseName: process.env.RELEASE_NAME || null,
  defaultContentPackURL: process.env.DEFAULT_CONTENT_PACK_URL
}

server.url =
  process.env.SERVER_URL ||
  url.format(kubernetesEnabled ? { protocol: 'https', hostname: server.hostname } : { protocol: 'https', ...server })

export const serverSeed = {
  path: 'server-setting',
  randomize: false,
  templates: [server]
}
