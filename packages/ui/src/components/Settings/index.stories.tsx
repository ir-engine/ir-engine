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

import type { Meta, StoryObj } from '@storybook/react'
import { http, HttpResponse } from 'msw'
import React, { useEffect, useState } from 'react'
import SettingsMenu from '.'

// Define types for our mock data
interface UserPreferences {
  theme: string
  notifications: boolean
  spatialAudio: boolean
  videoQuality: string
  micVolume: number
  audioVolume: number
}

interface UserData {
  id: string
  username: string
  email: string
  avatar: string
  preferences: UserPreferences
}

interface WorldFeatures {
  spatialAudio: boolean
  videoChat: boolean
  textChat: boolean
  animations: boolean
  vegetation: boolean
}

interface WorldSettings {
  id: string
  name: string
  description: string
  maxUsers: number
  features: WorldFeatures
}

// Mock user data for the API response
const mockUserData: UserData = {
  id: '12345',
  username: 'demo_user',
  email: 'demo@example.com',
  avatar: 'https://i.pravatar.cc/150?img=3',
  preferences: {
    theme: 'dark',
    notifications: true,
    spatialAudio: true,
    videoQuality: 'high',
    micVolume: 75,
    audioVolume: 60
  }
}

// Mock world settings data
const mockWorldSettings: WorldSettings = {
  id: 'world-123',
  name: 'Demo World',
  description: 'A demo world for testing',
  maxUsers: 20,
  features: {
    spatialAudio: true,
    videoChat: true,
    textChat: true,
    animations: true,
    vegetation: true
  }
}

const meta = {
  title: 'UI/Settings Menu',
  component: SettingsMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A settings menu component with iPhone-like slide transitions between screens.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    onClose: { action: 'closed' }
  }
} satisfies Meta<typeof SettingsMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <div
        className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover'
        }}
      >
        <button
          className="rounded-md bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close Settings' : 'Open Settings'}
        </button>
        {open && <SettingsMenu {...args} onClose={() => setOpen(false)} />}
      </div>
    )
  }
}

export const WithColorfulBackground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <div
        className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1579546929662-711aa81148cf?q=80&w=2070&auto=format&fit=crop)',
          backgroundSize: 'cover'
        }}
      >
        <button
          className="rounded-md bg-white/20 px-6 py-3 font-bold text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/30"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close Settings' : 'Open Settings'}
        </button>
        {open && <SettingsMenu {...args} onClose={() => setOpen(false)} />}
      </div>
    )
  }
}

export const WithGradientBackground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <div
        className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
        style={{
          background: 'linear-gradient(135deg, #FF9D6C 0%, #BB4E75 100%)'
        }}
      >
        <button
          className="rounded-xl bg-white/10 px-6 py-3 font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20"
          onClick={() => setOpen(!open)}
        >
          {open ? 'Close Settings' : 'Open Settings'}
        </button>
        {open && <SettingsMenu {...args} onClose={() => setOpen(false)} />}
      </div>
    )
  }
}

// Example story that uses MSW to mock API responses
export const WithMockedAPI: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    const [userData, setUserData] = useState<UserData | null>(null)
    const [worldSettings, setWorldSettings] = useState<WorldSettings | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Fetch user data when the settings menu is opened
    useEffect(() => {
      if (open) {
        setIsLoading(true)

        // Fetch user data
        fetch('/api/user/profile')
          .then((res) => res.json())
          .then((data) => {
            setUserData(data)
            console.log('User data loaded:', data)
          })
          .catch((error) => {
            console.error('Error fetching user data:', error)
          })
          .finally(() => setIsLoading(false))

        // Fetch world settings
        fetch('/api/world/settings')
          .then((res) => res.json())
          .then((data) => {
            setWorldSettings(data)
            console.log('World settings loaded:', data)
          })
          .catch((error) => {
            console.error('Error fetching world settings:', error)
          })
      }
    }, [open])

    return (
      <div
        className="flex h-screen w-screen items-center justify-center bg-cover bg-center"
        style={{
          background: 'linear-gradient(145deg, #2A2A72 0%, #009FFD 100%)'
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <button
            className="rounded-xl bg-white/10 px-6 py-3 font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Close Settings' : 'Open Settings with Mocked API'}
          </button>

          {isLoading && <div className="text-white">Loading data from API...</div>}

          {userData && !open && (
            <div className="mt-4 rounded-lg bg-white/10 p-4 text-white backdrop-blur-md">
              <h3 className="mb-2 text-lg font-semibold">API Data Loaded:</h3>
              <p>User: {userData.username}</p>
              <p>Theme: {userData.preferences.theme}</p>
              <p>World: {worldSettings?.name}</p>
            </div>
          )}
        </div>

        {open && <SettingsMenu {...args} onClose={() => setOpen(false)} />}
      </div>
    )
  },
  parameters: {
    msw: {
      handlers: [
        // Mock the user profile API endpoint
        http.get('/api/user/profile', () => {
          return HttpResponse.json(mockUserData)
        }),

        // Mock the world settings API endpoint
        http.get('/api/world/settings', () => {
          return HttpResponse.json(mockWorldSettings)
        }),

        // Mock a POST request to update user preferences
        http.post('/api/user/preferences', async ({ request }) => {
          const updatedPreferences = await request.json()
          return HttpResponse.json({
            success: true,
            message: 'Preferences updated successfully',
            preferences: updatedPreferences
          })
        })
      ]
    }
  }
}
