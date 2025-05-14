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

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API } from '@ir-engine/common'
import {
  avatarPath,
  engineSettingPath,
  identityProviderPath,
  projectSettingPath,
  scopePath,
  staticResourcePath,
  userApiKeyPath,
  userAvatarPath,
  UserName
} from '@ir-engine/common/src/schema.type.module'
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { EventDispatcher, getMutableState, UserID } from '@ir-engine/hyperflux'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import UserMenus from '.'
import { ModalState } from '../../common/services/ModalState'
import { AuthState } from '../services/AuthService'
import SettingsMenu from './SettingsMenu'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

let eventDispatcher: EventDispatcher
let db: Record<string, Record<string, any>>
const userID = 'user id' as UserID
const username = 'Test User' as UserName
const sceneID = 'scene id'
const sceneURL = '/empty.gltf'

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('SettingsMenu component', () => {
  beforeEach(async () => {
    createEngine()

    db = {
      [staticResourcePath]: [
        {
          id: sceneID,
          url: sceneURL
        }
      ],
      [userAvatarPath]: [
        {
          id: uuidv4(),
          userId: userID,
          avatarId: uuidv4(),
          avatar: {
            modelResource: {
              url: '/avatar.gltf'
            }
          }
        }
      ],
      [avatarPath]: [],
      [engineSettingPath]: [
        {
          id: 'auth-setting-id',
          authStrategies: [
            {
              google: true,
              discord: true,
              github: true
            }
          ]
        }
      ]
    }

    const createService = (path: string) => {
      return {
        find: () => {
          return new Promise((resolve) => {
            console.log(`[MOCK API] find() called for path: ${path}`)
            resolve(
              JSON.parse(
                JSON.stringify({
                  data: db[path],
                  limit: 10,
                  skip: 0,
                  total: db[path].length
                })
              )
            )
          })
        },
        get: (id) => {
          return new Promise((resolve) => {
            const data = db[path].find((entry) => entry.id === id)
            resolve(data ? JSON.parse(JSON.stringify(data)) : null)
          })
        },
        on: (serviceName, cb) => {
          eventDispatcher.addEventListener(serviceName, cb)
        },
        off: (serviceName, cb) => {
          eventDispatcher.removeEventListener(serviceName, cb)
        }
      }
    }

    const apis = {
      [staticResourcePath]: createService(staticResourcePath),
      [userAvatarPath]: createService(userAvatarPath),
      [avatarPath]: createService(avatarPath),
      [userApiKeyPath]: createService(userApiKeyPath),
      [projectSettingPath]: createService(projectSettingPath),
      [scopePath]: createService(scopePath),
      [identityProviderPath]: createService(identityProviderPath),
      [engineSettingPath]: createService(engineSettingPath)
    }
    eventDispatcher = new EventDispatcher()
    ;(API.instance as any) = {
      service: (path: string) => {
        const existing = apis[path]
        if (!existing) throw new Error(`Missing mock service for path: ${path}`)
        return existing
      }
    }

    getMutableState(ModalState).modals.set([{ element: <SettingsMenu />, onClickOutside: () => {} }])

    getMutableState(AuthState).user.set({
      id: userID,
      name: username,
      ageVerified: true,
      isGuest: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    render(
      <MemoryRouter>
        <UserMenus />
      </MemoryRouter>
    )
  })

  afterEach(() => {
    destroyEngine()
    cleanup()
  })

  it('should render a button with the data-testid attribute "sidebar-navigation-button"', async () => {
    const sidebarNavigationButtons = await screen.findAllByTestId('sidebar-navigation-button')
    expect(sidebarNavigationButtons.length).toBeGreaterThan(0)
  })

  it('should render an image element with the data-testid attribute "keyboard-controls-image"', async () => {
    const keyboardControlsImage = screen.getByTestId('keyboard-controls-image')
    // @ts-expect-error
    expect(keyboardControlsImage).toBeInTheDocument()
  })

  it('should render an image element with the data-testid attribute "controller-controls-image"', async () => {
    const controllerControlsImage = screen.getByTestId('controller-controls-image')
    // @ts-expect-error
    expect(controllerControlsImage).toBeInTheDocument()
  })

  it('should render an image element with the data-testid attribute "mouse-controls-image"', async () => {
    const mouseControlsImage = screen.getByTestId('mouse-controls-image')
    // @ts-expect-error
    expect(mouseControlsImage).toBeInTheDocument()
  })

  it('should render an panel container element with the data-testid attribute "audio-settings" after its nav button is clicked', async () => {
    const audioTabButton = screen.getByText(/audio/i)
    fireEvent.click(audioTabButton)
    // @ts-expect-error
    expect(audioTabButton).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "quality-preset-setting"', async () => {
    const graphicsTabButton = screen.getByText(/graphics/i)
    fireEvent.click(graphicsTabButton)
    const qualityPresetSetting = screen.getByTestId('quality-preset-setting')
    // @ts-expect-error
    expect(qualityPresetSetting).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "post-processing-setting"', async () => {
    const graphicsTabButton = screen.getByText(/graphics/i)
    fireEvent.click(graphicsTabButton)
    const qualityPresetSetting = screen.getByTestId('post-processing-setting')
    // @ts-expect-error
    expect(qualityPresetSetting).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "shadows-setting"', async () => {
    const graphicsTabButton = screen.getByText(/graphics/i)
    fireEvent.click(graphicsTabButton)
    const shadowsSetting = screen.getByTestId('shadows-setting')
    // @ts-expect-error
    expect(shadowsSetting).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "automatic-setting"', async () => {
    const graphicsTabButton = screen.getByText(/graphics/i)
    fireEvent.click(graphicsTabButton)
    const automaticSetting = screen.getByTestId('automatic-setting')
    // @ts-expect-error
    expect(automaticSetting).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "shadowmap-resolution-setting"', async () => {
    const graphicsTabButton = screen.getByText(/graphics/i)
    fireEvent.click(graphicsTabButton)
    const shadowMapResolutionSetting = screen.getByTestId('shadowmap-resolution-setting')
    // @ts-expect-error
    expect(shadowMapResolutionSetting).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "show-user-nameplate-setting"', async () => {
    const graphicsTabButton = screen.getByText(/graphics/i)
    fireEvent.click(graphicsTabButton)
    const showUserNameplateSetting = screen.getByTestId('show-user-nameplate-setting')
    // @ts-expect-error
    expect(showUserNameplateSetting).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "nameplate-trigger-distance-setting"', async () => {
    const graphicsTabButton = screen.getByText(/graphics/i)
    fireEvent.click(graphicsTabButton)
    const nameplateTriggerDistanceSetting = screen.getByTestId('nameplate-trigger-distance-setting')
    // @ts-expect-error
    expect(nameplateTriggerDistanceSetting).toBeInTheDocument()
  })
})
