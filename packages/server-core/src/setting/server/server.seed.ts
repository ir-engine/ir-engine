import appRootPath from 'app-root-path'
import path from 'path'

export const serverSeed = {
  path: 'server',
  randomize: false,
  templates: [
    {
      enabled: 'true',
      mode: 'local',
      hostname: 'localhost',
      port: '3030',
      clientHost: 'localhost:3000',
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
      gaTrackingId: 'test',
      hubEndpoint: process.env.HUB_ENDPOINT,
      paginate: 100,
      url: 'test',
      certPath: appRootPath.path.toString() + '/' + process.env.CERT,
      keyPath: appRootPath.path.toString() + '/' + process.env.KEY,
      local: process.env.LOCAL === 'true',
      releaseName: 'test',
      defaultContentPackURL: 'test'
    }
  ]
}
