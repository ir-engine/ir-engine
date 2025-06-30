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

import { Decorator } from '@storybook/react'
import React from 'react'
import { CustomStorybookRouter, SimpleStorybookRouter } from '../router/CustomStorybookRouter'
import { RouterConfig } from '../router/RouterUtils'

/**
 * Enhanced Router Decorator for Storybook
 * Uses CustomStorybookRouter to provide flexible routing setup with context support
 */
const RouterDecorator: Decorator = (Story, context) => {
  // Get router configuration from story parameters
  const routerConfig = context.parameters?.router as RouterConfig | undefined

  // If no router config is provided, use simple router
  if (!routerConfig) {
    return (
      <SimpleStorybookRouter>
        <Story />
      </SimpleStorybookRouter>
    )
  }

  // Use CustomStorybookRouter with full configuration
  return (
    <CustomStorybookRouter config={routerConfig}>
      <Story />
    </CustomStorybookRouter>
  )
}

/**
 * Alternative decorator that always uses SimpleStorybookRouter
 * Useful for stories that need basic routing without custom configuration
 */
export const SimpleRouterDecorator: Decorator = (Story, context) => {
  const routerConfig = context.parameters?.router as { initialEntries?: string[]; initialIndex?: number } | undefined

  return (
    <SimpleStorybookRouter initialEntries={routerConfig?.initialEntries} initialIndex={routerConfig?.initialIndex}>
      <Story />
    </SimpleStorybookRouter>
  )
}

/**
 * Decorator factory that creates a router decorator with predefined configuration
 */
export const createRouterDecorator = (defaultConfig: RouterConfig): Decorator => {
  return (Story, context) => {
    const routerConfig = context.parameters?.router as RouterConfig | undefined

    // Merge default config with story-specific config
    const mergedConfig: RouterConfig = {
      ...defaultConfig,
      ...routerConfig,
      routes: [...(defaultConfig.routes || []), ...(routerConfig?.routes || [])]
    }

    return (
      <CustomStorybookRouter config={mergedConfig}>
        <Story />
      </CustomStorybookRouter>
    )
  }
}

/**
 * Predefined decorators for common scenarios
 */

// Admin routes decorator
export const AdminRouterDecorator = createRouterDecorator({
  initialEntries: ['/admin'],
  routes: [
    { path: '/admin', element: <div className="bg-blue-100 p-4">Admin Dashboard</div> },
    { path: '/admin/users', element: <div className="bg-green-100 p-4">User Management</div> },
    { path: '/admin/settings', element: <div className="bg-yellow-100 p-4">Settings</div> }
  ]
})

// Location routes decorator
export const LocationRouterDecorator = createRouterDecorator({
  initialEntries: ['/location'],
  routes: [
    { path: '/location', element: <div className="bg-purple-100 p-4">Location</div> },
    { path: '/location/:id', element: <div className="bg-pink-100 p-4">Location Details</div> }
  ]
})

// Basic navigation decorator
export const BasicRouterDecorator = createRouterDecorator({
  initialEntries: ['/'],
  routes: [
    { path: '/', element: <div className="bg-gray-100 p-4">Home</div> },
    { path: '/about', element: <div className="bg-blue-100 p-4">About</div> },
    { path: '/contact', element: <div className="bg-green-100 p-4">Contact</div> }
  ]
})

export default RouterDecorator
