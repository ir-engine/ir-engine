export interface ServerSetting {
  id: string
  hostname?: string
  serverEnabled: boolean
  serverMode?: string
  port?: string
  clientHost?: string
  rootDir?: string
  publicDir?: string
  nodeModulesDir?: string
  localStorageProvider?: string
  performDryRun?: boolean
  storageProvider?: string
  gaTrackingId?: string
  hub: HubInfo
  paginate?: number
  url?: string
  certPath?: string
  keyPath?: string
  local?: boolean
  releaseName?: string
}

export interface HubInfo {
  endpoint?: string
}
