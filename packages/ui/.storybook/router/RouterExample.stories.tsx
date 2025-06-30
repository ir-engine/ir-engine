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

import { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useStorybookRouter } from './CustomStorybookRouter'
import { commonRoutes, createRouterParameters } from './RouterUtils'

const meta: Meta = {
  title: 'Router/Examples',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Examples demonstrating the custom React Router setup for Storybook'
      }
    }
  }
}

export default meta

// Basic navigation component
const NavigationExample: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Router Navigation Example</h2>
      <p className="text-gray-600">Current path: {location.pathname}</p>

      <div className="space-x-4">
        <button onClick={() => navigate('/')} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          Home
        </button>
        <button
          onClick={() => navigate('/about')}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          About
        </button>
        <button
          onClick={() => navigate('/contact')}
          className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600"
        >
          Contact
        </button>
      </div>

      <div className="mt-6 rounded bg-gray-100 p-4">
        <h3 className="font-semibold">Navigation with Links:</h3>
        <div className="mt-2 space-x-4">
          <Link to="/" className="text-blue-600 hover:underline">
            Home Link
          </Link>
          <Link to="/about" className="text-blue-600 hover:underline">
            About Link
          </Link>
          <Link to="/contact" className="text-blue-600 hover:underline">
            Contact Link
          </Link>
        </div>
      </div>
    </div>
  )
}

// Component that uses the custom router context
const RouterContextExample: React.FC = () => {
  try {
    const { currentPath, navigate, routes } = useStorybookRouter()

    return (
      <div className="space-y-4 p-6">
        <h2 className="text-2xl font-bold">Router Context Example</h2>
        <p className="text-gray-600">Current path from context: {currentPath}</p>

        <div className="space-y-2">
          <h3 className="font-semibold">Available Routes:</h3>
          <ul className="list-inside list-disc">
            {routes.map((route, index) => (
              <li key={index} className="text-gray-700">
                {route.path}
              </li>
            ))}
          </ul>
        </div>

        <button onClick={() => navigate('/admin')} className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
          Navigate to Admin
        </button>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-6">
        <p className="text-red-600">
          Router context not available. This story needs to be wrapped with CustomStorybookRouter.
        </p>
      </div>
    )
  }
}

export const BasicNavigation: StoryObj = {
  render: () => <NavigationExample />,
  parameters: createRouterParameters({
    initialEntries: ['/'],
    routes: commonRoutes
  })
}

export const AdminRoutes: StoryObj = {
  render: () => <NavigationExample />,
  parameters: createRouterParameters({
    initialEntries: ['/admin'],
    routes: commonRoutes
  })
}

export const WithCustomRoutes: StoryObj = {
  render: () => <NavigationExample />,
  parameters: createRouterParameters({
    initialEntries: ['/'],
    routes: [
      { path: '/', element: <div className="bg-blue-100 p-4">Custom Home Page</div> },
      { path: '/dashboard', element: <div className="bg-green-100 p-4">Dashboard</div> },
      { path: '/profile', element: <div className="bg-yellow-100 p-4">Profile</div> }
    ]
  })
}

export const RouterContext: StoryObj = {
  render: () => <RouterContextExample />,
  parameters: createRouterParameters({
    initialEntries: ['/'],
    routes: commonRoutes
  })
}
