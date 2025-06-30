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

const meta: Meta = {
  title: 'Router/SimpleExample',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Example demonstrating the SimpleRouterDecorator for Storybook stories'
      }
    }
  }
}

export default meta

// Test component that shows current route and provides navigation
const RouterTestComponent: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-3xl font-bold text-gray-800">Simple Router Example</h1>
      <div className="rounded-lg bg-gray-100 p-4">
        <p className="text-lg font-semibold">
          Current Path: <span className="text-blue-600">{location.pathname}</span>
        </p>
        <p className="text-sm text-gray-600">Search: {location.search || 'None'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <button
          onClick={() => navigate('/')}
          className="rounded bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
        >
          Home
        </button>
        <button
          onClick={() => navigate('/about')}
          className="rounded bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
        >
          About
        </button>
        <button
          onClick={() => navigate('/contact')}
          className="rounded bg-purple-500 px-4 py-2 text-white transition-colors hover:bg-purple-600"
        >
          Contact
        </button>
        <button
          onClick={() => navigate('/admin')}
          className="rounded bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
        >
          Admin
        </button>
      </div>

      <div className="border-t pt-4">
        <h3 className="mb-2 text-lg font-semibold">Navigation Links:</h3>
        <div className="flex flex-wrap gap-4">
          <Link to="/" className="text-blue-600 hover:underline">
            Home Link
          </Link>
          <Link to="/about" className="text-blue-600 hover:underline">
            About Link
          </Link>
          <Link to="/contact" className="text-blue-600 hover:underline">
            Contact Link
          </Link>
          <Link to="/admin" className="text-blue-600 hover:underline">
            Admin Link
          </Link>
        </div>
      </div>

      <div className="rounded-lg bg-yellow-50 p-4">
        <h4 className="font-semibold text-yellow-800">Try navigating to different routes!</h4>
        <p className="text-sm text-yellow-700">
          This story uses the SimpleRouterDecorator which provides basic React Router functionality.
        </p>
      </div>
    </div>
  )
}

// Stories demonstrating the SimpleRouterDecorator

export const Default: StoryObj = {
  render: () => <RouterTestComponent />
}

export const WithCustomInitialRoute: StoryObj = {
  render: () => <RouterTestComponent />,
  parameters: {
    router: {
      initialEntries: ['/about'],
      initialIndex: 0
    }
  }
}

export const WithMultipleRoutes: StoryObj = {
  render: () => <RouterTestComponent />,
  parameters: {
    router: {
      initialEntries: ['/', '/about', '/contact'],
      initialIndex: 1
    }
  }
}
