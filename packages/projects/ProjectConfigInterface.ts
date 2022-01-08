import { World } from '@xrengine/engine/src/ecs/classes/World'
import type { Application } from '@xrengine/server-core/declarations'

export interface ProjectConfigInterface {
  /**
   * See ProjectEventHooks
   */
  onEvent?: string

  /**
   * URL path to thumbnail
   */
  thumbnail?: string

  /**
   * Custom Routes
   * Loaded by the client to enable custom front end webapp routes
   * JSX component and props are loaded into the react router on the front end
   * The key of the object represents the route in the format '/myroute'
   */
  routes?: {
    [route: string]: {
      component: () => Promise<{ default: (props: any) => JSX.Element }>
      props?: {
        [x: string]: any
        exact?: boolean
      }
    }
  }

  /**
   * Webapp Injection
   * This is loaded on ALL pages if enabled
   * Allows for loading of site-wide state and other globals
   */
  webappInjection?: () => Promise<{ default: (props: any) => void | JSX.Element }>

  /**
   * World Injection
   * This is loaded on ALL instances of the engine if enabled
   * Allows for running of custom logic regardless of which scene or route is loaded
   */
  worldInjection?: () => Promise<{ default: (world: World) => Promise<void> }>

  /**
   * Services
   * Adds custom services to the backend, as well as enabling arbitrary injection into the backend
   * @returns {Array<InstallFunctionType>}
   */
  services?: string

  /**
   * Adds configurations to the database seeder
   * @returns {Array<ServicesSeedConfig>}
   */
  databaseSeed?: string
}

type InstallFunctionType = (app: Application) => Promise<any>

/**
 *
 */
export interface ProjectEventHooks {
  onInstall?: InstallFunctionType
  onUpdate?: InstallFunctionType
  onUninstall?: InstallFunctionType
}

export type ProjectEventHookType = keyof ProjectEventHooks
