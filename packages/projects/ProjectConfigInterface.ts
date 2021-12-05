import type { Application } from '@xrengine/server-core/declarations'

export interface ProjectConfigInterface {
  onEvent?: string // returns ProjectEventHooks import
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
  services?: string
  databaseSeed?: string
}

type InstallFunctionType = (app: Application) => Promise<any>

export interface ProjectEventHooks {
  onInstall?: InstallFunctionType
  onUpdate?: InstallFunctionType
  onUninstall?: InstallFunctionType
}

export type ProjectEventHookType = keyof ProjectEventHooks
