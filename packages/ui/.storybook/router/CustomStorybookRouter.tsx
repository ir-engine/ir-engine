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

import { MemoryHistory } from 'history'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { MemoryRouter, Route, Router, Routes } from 'react-router-dom'
import { createStorybookHistory, RouteConfig, RouterConfig } from './RouterUtils'

// Context for sharing router state across stories
export interface StorybookRouterContextType {
  history: MemoryHistory
  navigate: (path: string) => void
  currentPath: string
  routes: RouteConfig[]
}

const StorybookRouterContext = createContext<StorybookRouterContextType | null>(null)

export const useStorybookRouter = () => {
  const context = useContext(StorybookRouterContext)
  if (!context) {
    throw new Error('useStorybookRouter must be used within a CustomStorybookRouter')
  }
  return context
}

interface CustomStorybookRouterProps {
  children: React.ReactNode
  config?: RouterConfig
}

/**
 * Custom Router Component for Storybook
 * Provides enhanced routing capabilities with context and utilities
 */
export const CustomStorybookRouter: React.FC<CustomStorybookRouterProps> = ({ children, config = {} }) => {
  const { initialEntries = ['/'], initialIndex = 0, routes = [], history: providedHistory } = config

  const [history] = useState(() => providedHistory || createStorybookHistory(initialEntries, initialIndex))

  const [currentPath, setCurrentPath] = useState(history.location.pathname)

  useEffect(() => {
    const unlisten = history.listen(({ location }) => {
      setCurrentPath(location.pathname)
    })
    return unlisten
  }, [history])

  const navigate = (path: string) => {
    history.push(path)
  }

  const contextValue: StorybookRouterContextType = {
    history,
    navigate,
    currentPath,
    routes
  }

  return (
    <StorybookRouterContext.Provider value={contextValue}>
      <Router location={history.location} navigator={history}>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<>{children}</>} />
        </Routes>
      </Router>
    </StorybookRouterContext.Provider>
  )
}

/**
 * Simple Memory Router wrapper for basic routing needs
 */
export const SimpleStorybookRouter: React.FC<{
  children: React.ReactNode
  initialEntries?: string[]
  initialIndex?: number
}> = ({ children, initialEntries = ['/'], initialIndex = 0 }) => {
  return (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      <Routes>
        <Route path="*" element={<>{children}</>} />
      </Routes>
    </MemoryRouter>
  )
}

/**
 * Router Outlet component for use with storybook-addon-remix-react-router
 */
export const RouterOutlet: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <div className="router-outlet">{children}</div>
}

export default CustomStorybookRouter
