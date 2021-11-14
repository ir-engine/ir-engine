type ServicesSeedCallback = (obj: any, seed: SeedCallback) => Promise<any>
type SeedCallback = (ServicesSeedConfig) => Promise<any>

export interface ServicesSeedConfig {
  count?: number
  disabled?: boolean
  delete?: boolean
  path?: string
  randomize?: boolean
  templates?: any[]
  callback?: ServicesSeedCallback
}
