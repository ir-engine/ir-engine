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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { createMemoryHistory, MemoryHistory } from 'history'
import React from 'react'

export interface RouteConfig {
  path: string
  element: React.ReactElement
}

export interface RouterConfig {
  initialEntries?: string[]
  initialIndex?: number
  routes?: RouteConfig[]
  history?: MemoryHistory
}

/**
 * Creates a memory history instance for Storybook
 */
export const createStorybookHistory = (initialEntries: string[] = ['/'], initialIndex: number = 0): MemoryHistory => {
  return createMemoryHistory({
    initialEntries,
    initialIndex
  })
}

/**
 * Helper function to create router parameters for stories
 */
export const createRouterParameters = (config: RouterConfig = {}) => {
  return {
    router: {
      initialEntries: config.initialEntries || ['/'],
      initialIndex: config.initialIndex || 0,
      routes: config.routes || [],
      history: config.history || createStorybookHistory(config.initialEntries, config.initialIndex)
    }
  }
}

/**
 * Common route configurations for different story types
 */
export const commonRoutes: RouteConfig[] = [
  { path: '/', element: <div>Home</div> },
  { path: '/about', element: <div>About</div> },
  { path: '/contact', element: <div>Contact</div> }
]

/**
 * Utility to merge route configurations
 */
export const mergeRoutes = (...routeArrays: RouteConfig[][]): RouteConfig[] => {
  return routeArrays.flat()
}

/**
 * Helper to create navigation actions for stories
 */
export const createNavigationActions = (history: MemoryHistory) => ({
  push: (path: string) => history.push(path),
  replace: (path: string) => history.replace(path),
  go: (delta: number) => history.go(delta),
  // goBack: () => history.goBack(),
  // goForward: () => history.goForward(),
  getCurrentLocation: () => history.location
})
