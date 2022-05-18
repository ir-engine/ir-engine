type ServicesSeedCallback = (obj: any, seed: SeedCallback) => Promise<any>
type SeedCallback = (ServicesSeedConfig) => Promise<any>

export interface ServicesSeedConfig {
  path?: string
  templates?: any[]
  callback?: ServicesSeedCallback
}
