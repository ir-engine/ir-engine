import type { Application } from '@xrengine/server-core/declarations'

export interface ProjectConfigInterface {
  onEvent?: string // returns ProjectEventHooks
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

type InstallFunctionType = Promise<{ default: (app: Application) => void }>

export interface ProjectEventHooks {
  onInstall?: InstallFunctionType
  onUpdate?: InstallFunctionType
  onUninstall?: InstallFunctionType
}

export type ProjectEventHookType = keyof ProjectEventHooks
