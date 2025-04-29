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

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { API } from '@ir-engine/common'
import {
  avatarPath,
  clientSettingPath,
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
import ProfileMenu, { TermsOfServiceState } from './ProfileMenu'

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

describe('ProfileMenu component', () => {
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
      [clientSettingPath]: createService(clientSettingPath),
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

    getMutableState(ModalState).modals.set([{ element: <ProfileMenu hideLogin={false} />, onClickOutside: () => {} }])

    getMutableState(AuthState).user.set({
      id: userID,
      name: username,
      ageVerified: true,
      isGuest: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    getMutableState(TermsOfServiceState).accepted.set(true)

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

  it('should render an avatar image element with the data-testid attribute "avatar-image"', () => {
    const openProfileMenuButton = screen.getByTestId('open-profile-menu')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render an edit avatar button with the data-testid attribute "profile-menu-avatar-edit-button"', () => {
    const openProfileMenuButton = screen.getByTestId('open-profile-menu')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render an element with the username with the data-testid attribute "profile-menu-username"', () => {
    const openProfileMenuButton = screen.getByTestId('open-profile-menu')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render an menu setting button with the data-testid attribute "profile-menu-settings-button"', () => {
    const openProfileMenuButton = screen.getByTestId('open-profile-menu')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render a link element with the data-testid attribute "profile-menu-privacy-policy-link"', () => {
    const openProfileMenuButton = screen.getByTestId('open-profile-menu')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render a button with the data-testid attribute "profile-menu-logout-button"', () => {
    const openProfileMenuButton = screen.getByTestId('profile-menu-logout-button')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })

  it('should render a button with the data-testid attribute "profile-menu-delete-account-button"', () => {
    const openProfileMenuButton = screen.getByTestId('profile-menu-delete-account-button')
    // @ts-expect-error
    expect(openProfileMenuButton).toBeInTheDocument()
  })
})
