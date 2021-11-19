import type { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import type { Application } from '@xrengine/server-core/declarations'

export interface ProjectConfigInterface {
  thumbnail?: string
  routes?: {
    [route: string]: {
      component: () => Promise<{ default: (props: any) => JSX.Element }>
      props?: {
        [x: string]: any
        exact?: boolean
      }
    }
  }
  services?: () => Promise<{ default: Array<(app: Application) => void> }>
  databaseSeed?: Promise<{ default: Array<ServicesSeedConfig> }>
}
