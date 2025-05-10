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
import React, { useEffect, useRef, useState } from 'react'
import SettingsMenu from '.'
import EngineCanvasStory from './EngineCanvasStory'

// Import engine-related components and hooks
import { useSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { useEngineCanvas } from '@ir-engine/spatial/src/renderer/functions/useEngineCanvas'
//@ts-ignore

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

// Example story that uses a basic 3D engine canvas
export const WithEngineCanvas: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Initialize the spatial engine
    useSpatialEngine()

    // Use the engine canvas with our container ref
    useEngineCanvas(containerRef)

    // Engine settings are fetched from the API in a real implementation
    // We're using MSW to mock the API responses

    return (
      <div ref={containerRef} className="relative flex h-screen w-screen items-center justify-center">
        {/* The engine canvas will be attached to this container */}

        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <button
            className="rounded-xl bg-white/10 px-6 py-3 font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/20"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Close Settings' : 'Open 3D Engine Settings'}
          </button>
        </div>

        {open && <SettingsMenu {...args} onClose={() => setOpen(false)} />}
      </div>
    )
  },
  parameters: {
    msw: {
      handlers: [
        // Mock API endpoints for engine settings
        http.get('/api/engine/settings', () => {
          return HttpResponse.json({
            renderQuality: 'high',
            antialiasing: true,
            shadows: true,
            postProcessing: true,
            shadowMapResolution: 2048,
            maxLights: 8
          })
        }),

        // Mock endpoint to update engine settings
        http.post('/api/engine/settings', async ({ request }) => {
          const updatedSettings = await request.json()
          return HttpResponse.json({
            success: true,
            message: 'Engine settings updated successfully',
            settings: updatedSettings
          })
        })
      ]
    }
  }
}

// Example story that uses the 3D engine canvas and loads a GLTF model
export const With3DScene: Story = {
  render: () => <EngineCanvasStory />,
  parameters: {
    layout: 'fullscreen',
    msw: {
      handlers: [
        // Mock API endpoints for engine settings
        http.get('/api/engine/settings', () => {
          return HttpResponse.json({
            renderQuality: 'high',
            antialiasing: true,
            shadows: true,
            postProcessing: true,
            shadowMapResolution: 2048,
            maxLights: 8
          })
        }),

        // Mock endpoint to update engine settings
        http.post('/api/engine/settings', async ({ request }) => {
          const updatedSettings = await request.json()
          return HttpResponse.json({
            success: true,
            message: 'Engine settings updated successfully',
            settings: updatedSettings
          })
        }),

        // Intercept requests for spawn-point.glb and return default.gltf instead
        http.get('/static/editor/spawn-point.glb', () => {
          // Use the default scene GLTF content
          const defaultScene = {
            asset: {
              generator: 'IREngine.SceneExporter',
              version: '2.0'
            },
            nodes: [
              {
                name: 'Settings',
                extensions: {
                  EE_uuid: '0d5a20e1-abe2-455e-9963-d5e1e19fca19',
                  EE_visible: true
                }
              },
              {
                name: 'platform',
                extensions: {
                  EE_uuid: '685c48da-e2a0-4a9a-af7c-c5a3c187c99a',
                  EE_model: {
                    src: '__$project$__/ir-engine/default-project/assets/platform.glb',
                    cameraOcclusion: true,
                    applyColliders: false,
                    shape: 'box'
                  },
                  EE_visible: true,
                  EE_shadow: {
                    cast: true,
                    receive: true
                  }
                }
              },
              {
                name: 'directional light',
                matrix: [
                  0.8201518642540717, 0.2860729507918132, -0.49549287218469207, 0, -2.135677357184562e-9,
                  0.866025399522099, 0.5000000073825887, 0, 0.5721458901019657, -0.41007593712366663,
                  0.7102723465203862, 0, 0, 0, 0, 1
                ],
                extensions: {
                  EE_uuid: 'cb045cfd-8daf-4a2b-b764-35625be54a11',
                  EE_directional_light: {
                    color: 16777215,
                    intensity: 1,
                    castShadow: true,
                    shadowBias: -0.00001,
                    shadowRadius: 1,
                    cameraFar: 50
                  },
                  EE_visible: true
                }
              }
            ],
            scene: 0,
            scenes: [
              {
                nodes: [0, 1, 2]
              }
            ],
            extensionsUsed: ['EE_uuid', 'EE_visible', 'EE_model', 'EE_shadow', 'EE_directional_light']
          }

          // Return the default scene content with appropriate headers
          return HttpResponse.json(defaultScene, {
            headers: {
              'Content-Type': 'model/gltf+json'
            }
          })
        }),

        // Intercept requests for platform.glb and return platform.gltf instead
        http.get('**/platform.glb', () => {
          // Platform GLTF content as JSON
          const platformGltf = {
            asset: {
              version: '2.0',
              generator: 'THREE.GLTFExporter'
            },
            scenes: [
              {
                name: 'platform',
                nodes: [2],
                extras: {
                  src: '__$project$__/default-project/assets/platform.glb'
                }
              }
            ],
            scene: 0,
            nodes: [
              {
                matrix: [10, 0, 0, 0, 0, 0.10000000149011612, 0, 0, 0, 0, 10, 0, 0, -0.10000000149011612, 0, 1],
                name: 'Collider',
                extras: {
                  name: 'Collider'
                },
                mesh: 0,
                extensions: {
                  EE_uuid: '0b77bd2a-245e-4717-8938-ff5946c6fd6d',
                  EE_collider: {
                    shape: 'box',
                    mass: 1,
                    massCenter: {
                      x: 0,
                      y: 0,
                      z: 0
                    },
                    friction: 0.5,
                    restitution: 0.5,
                    collisionLayer: 1,
                    collisionMask: 7
                  },
                  EE_shadow: {
                    cast: true,
                    receive: true
                  },
                  EE_envmap: {
                    type: 'Skybox',
                    envMapTextureType: 'Equirectangular',
                    envMapSourceColor: 4095,
                    envMapSourceURL: '',
                    envMapSourceEntityUUID: '',
                    envMapIntensity: 1
                  }
                }
              },
              {
                name: 'Geometry',
                extras: {
                  name: 'Geometry'
                },
                mesh: 1,
                extensions: {
                  EE_uuid: '80f1b0f4-8760-43da-9268-8967f12a74c4',
                  EE_visible: true,
                  EE_shadow: {
                    cast: true,
                    receive: true
                  },
                  EE_envmap: {
                    type: 'Skybox',
                    envMapTextureType: 'Equirectangular',
                    envMapSourceColor: 4095,
                    envMapSourceURL: '',
                    envMapSourceEntityUUID: '',
                    envMapIntensity: 1
                  }
                }
              },
              {
                name: 'Base',
                children: [0, 1],
                extensions: {
                  EE_uuid: '340406cb-0abc-4855-bc02-0b80f4f5602f',
                  EE_rigidbody: {
                    type: 'fixed',
                    ccd: false,
                    allowRolling: true,
                    enabledRotations: [true, true, true],
                    canSleep: true,
                    gravityScale: 1
                  },
                  EE_visible: true
                }
              }
            ],
            // Include minimal buffer information to make it valid
            bufferViews: [
              {
                buffer: 0,
                byteOffset: 0,
                byteLength: 288,
                target: 34962,
                byteStride: 12
              }
            ],
            buffers: [
              {
                byteLength: 1824
              }
            ],
            // Include minimal material information
            materials: [
              {
                name: 'Material',
                extensions: {
                  EE_material: {
                    uuid: '7e03c4c7-69a6-4a75-b7a8-e0aea366418a',
                    name: 'Material',
                    prototype: 'MeshStandardMaterial'
                  }
                }
              }
            ],
            // Include minimal mesh information
            meshes: [
              {
                primitives: [
                  {
                    mode: 4,
                    material: 0
                  }
                ],
                extensions: {
                  EE_resourceId: {
                    resourceId: '1523377b-707e-43d4-9154-11c6ed710de5'
                  }
                }
              },
              {
                primitives: [
                  {
                    mode: 4,
                    material: 0
                  }
                ],
                extensions: {
                  EE_resourceId: {
                    resourceId: '12b43d2a-a89d-4c1b-9058-065989af7687'
                  }
                }
              }
            ],
            extensionsUsed: [
              'EE_material',
              'EE_resourceId',
              'EE_uuid',
              'EE_collider',
              'EE_shadow',
              'EE_envmap',
              'EE_visible',
              'EE_rigidbody'
            ]
          }

          // Return the platform GLTF content with appropriate headers
          return HttpResponse.json(platformGltf, {
            headers: {
              'Content-Type': 'model/gltf+json'
            }
          })
        })
      ]
    }
  }
}
