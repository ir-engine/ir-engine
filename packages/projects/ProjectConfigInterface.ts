/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { OembedType, ProjectType } from '@ir-engine/common/src/schema.type.module'
import type { Application } from '@ir-engine/server-core/declarations'

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
      componentProps?: {
        [x: string]: any
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
  worldInjection?: () => Promise<{ default?: () => Promise<void> } | any>
  /**
   * Services
   * Adds custom services to the backend, as well as enabling arbitrary injection into the backend
   * @returns {Array<InstallFunctionType>}
   */
  services?: string

  /**
   * Adds configurations to the database seeder
   * @returns {Array<KnexSeed>}
   */
  databaseSeed?: string
}

type InstallFunctionType = (app: Application, project: ProjectType) => Promise<any>
type OEmbedFunctionType = (
  app: Application,
  project: ProjectType,
  url: URL,
  currentOEmbed: OembedType
) => Promise<OembedType | null>

/**
 *
 */
export interface ProjectEventHooks {
  /**
   * Runs when a project is installed.
   * In local, the next time `npm run dev` is run.
   * In k8s, the next time the builder is run, OR immediately after the project is updated.
   */
  onInstall?: InstallFunctionType
  /** Runs every time a project is updated in a deployment OR when the builder runs */
  onUpdate?: InstallFunctionType
  /** Runs when a project is uninstalled */
  onUninstall?: InstallFunctionType
  /**
   * get oEmbed for active routes that match URL
   * return that project's onOEmbedRequest()
   * if null, return default
   */
  onOEmbedRequest?: OEmbedFunctionType
}

export type ProjectEventHookType = keyof ProjectEventHooks

/**
 * Systems imported from a scene MUST have their filename end with `System.ts` and be in the `/src/systems` folder.
 * This is to optimize vite's code-splitting bundling process, as each potentially dynamically
 * importable file will result in a new bundle with it's own copy of all of it's import dependencies.
 */
