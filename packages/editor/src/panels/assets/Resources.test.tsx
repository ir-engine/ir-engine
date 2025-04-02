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
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { FileThumbnailJobState } from '@ir-engine/client-core/src/common/services/FileThumbnailJobState'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { FileUploadState } from '@ir-engine/client-core/src/util/upload'
import React from 'react'
import { FilesViewModeSettings } from '../../services/FilesState'
import { ClickPlacementState } from '../../systems/ClickPlacementSystem'
import Resources from './resources'

describe('Resources component', () => {
  beforeAll(() => {
    const mockIntersectionObserver = vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      takeRecords: vi.fn(() => []),
      root: null,
      rootMargin: '',
      thresholds: []
    }))

    global.IntersectionObserver = mockIntersectionObserver

    vi.mock('react-i18next', () => ({
      useTranslation: () => ({
        t: (key: string) => key
      })
    }))

    vi.mock('@ir-engine/hyperflux', async (importOriginal) => {
      const actual = await importOriginal()
      return {
        // @ts-ignore
        ...actual,
        getMutableState: vi.fn().mockImplementation((stateDef) => {
          if (stateDef === FilesViewModeSettings) {
            return {
              icons: {
                iconSize: {
                  value: 48,
                  set: vi.fn()
                }
              }
            }
          }
        }),
        useMutableState: vi.fn().mockImplementation((stateDef) => {
          if (stateDef === FileThumbnailJobState) {
            return {
              jobs: []
            }
          } else if (stateDef === FileUploadState) {
            return {
              value: {}
            }
          } else if (stateDef === ClickPlacementState) {
            return {
              selectedAsset: {
                value: null,
                set: vi.fn()
              }
            }
          } else if (stateDef === AuthState) {
            return {
              user: {
                id: {
                  value: 'mock-user-id'
                }
              }
            }
          }
        })
      }
    })

    vi.mock('@ir-engine/engine/src/assets/classes/AssetLoader', () => ({
      AssetLoader: {
        getAssetType: vi.fn().mockReturnValue('image')
      }
    }))

    vi.mock('react-dnd', () => ({
      useDrag: vi.fn().mockReturnValue([null, vi.fn(), vi.fn()]),
      DragPreviewImage: vi.fn().mockReturnValue(null)
    }))

    vi.mock('./hooks', () => ({
      useAssetsCategory: vi.fn().mockReturnValue({
        currentCategoryPath: { set: vi.fn(), get: vi.fn().mockReturnValue('') },
        sidebarWidth: {
          value: 300,
          set: vi.fn()
        }
      }),
      useAssetsQuery: vi.fn().mockReturnValue({
        search: {
          value: ''
        },
        refetchResources: vi.fn(),
        staticResourcesPagination: {
          skip: {
            value: 0,
            set: vi.fn()
          },
          total: {
            value: 0,
            set: vi.fn()
          }
        },
        resources: [
          {
            id: 'mock-resource-id',
            key: 'mock-key',
            name: 'mock-name',
            url: 'mock-url',
            mimeType: 'image/png',
            thumbnailURL: '',
            tags: ['mock-tag']
          }
        ]
      })
    }))
    vi.mock('../files/helpers', async (importOriginal) => {
      const actual = await importOriginal()
      return {
        // @ts-ignore
        ...actual,
        useCurrentFiles: vi.fn().mockReturnValue({
          files: [],
          categories: {
            value: [],
            get: vi.fn().mockReturnValue([])
          },
          changeDirectoryByPath: vi.fn()
        })
      }
    })
  })
  beforeEach(() => {
    render(<Resources />)
  })

  afterEach(() => {
    cleanup()
  })

  it('should render a group of resource components with relevant data-testid attributes', async () => {
    const itemsContainer = screen.getByTestId('assets-panel-resource-items-container')
    // @ts-ignore
    expect(itemsContainer).toBeInTheDocument()

    const resourceItems = await screen.findAllByTestId('assets-panel-resource-items')
    expect(resourceItems.length).toBeGreaterThan(0)

    const resourceFiles = await screen.findAllByTestId('assets-panel-resource-file')
    expect(resourceFiles.length).toBeGreaterThan(0)

    const resourceIcons = await screen.findAllByTestId('assets-panel-resource-file-icon')
    expect(resourceIcons.length).toBeGreaterThan(0)

    const resourceFileNames = await screen.findAllByTestId('assets-panel-resource-file-name')
    expect(resourceFileNames.length).toBeGreaterThan(0)
  })
})
