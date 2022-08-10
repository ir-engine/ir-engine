export interface ServerSettingInterface {
  id: string
  hostname: string
  mode: string
  port: string
  clientHost: string
  rootDir: string
  publicDir: string
  nodeModulesDir: string
  localStorageProvider: string
  performDryRun: boolean
  storageProvider: string
  gaTrackingId: string
  hub: string
  url: string
  certPath: string
  keyPath: string
  gitPem: string
  local: boolean
  releaseName: string
  instanceserverUnreachableTimeoutSeconds: number
}
