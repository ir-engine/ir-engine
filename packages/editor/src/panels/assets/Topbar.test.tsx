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

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { EditorState } from '../../services/EditorServices'

import React from 'react'
import { FilesState, FilesViewModeSettings, FilesViewModeState } from '../../services/FilesState'
import Topbar from './topbar'

describe('Topbar component', () => {
  beforeAll(() => {
    vi.mock('@ir-engine/hyperflux', async (importOriginal) => {
      const actual = await importOriginal()
      return {
        // @ts-ignore
        ...actual,
        useMutableState: vi.fn().mockImplementation((stateDef) => {
          if (stateDef === EditorState) {
            return {
              projectName: {
                value: 'mock-project'
              }
            }
          } else if (stateDef === FilesState) {
            return {
              selectedDirectory: {
                value: '/mock-directory'
              },
              projectName: {
                value: 'mock-project'
              },
              searchText: {
                value: '',
                set: vi.fn()
              },
              merge: vi.fn()
            }
          } else if (stateDef === FilesViewModeSettings) {
            return {
              icons: {
                iconSize: {
                  value: 48,
                  set: vi.fn()
                }
              }
            }
          } else if (stateDef === FilesViewModeState) {
            return {
              viewMode: {
                value: 'icons'
              }
            }
          }
        })
      }
    })

    vi.mock('./hooks', () => ({
      useAssetsCategory: vi.fn().mockReturnValue({
        currentCategoryPath: { set: vi.fn(), get: vi.fn().mockReturnValue('') }
      }),
      useAssetsQuery: vi.fn().mockReturnValue({
        search: {
          value: ''
        },
        refetchResources: vi.fn(),
        staticResourcesPagination: {
          skip: { set: vi.fn() }
        }
      })
    }))
  })
  beforeEach(() => {
    render(<Topbar />)
  })

  afterEach(() => {
    cleanup()
  })

  it('should render an `Assets` toolbar with various elements that have relevant data-testid attributes', () => {
    const panelToolBar = screen.getByTestId('assets-panel-top-bar')
    // @ts-ignore
    expect(panelToolBar).toBeInTheDocument()

    const refreshButton = screen.getByTestId('assets-panel-refresh-button')
    // @ts-ignore
    expect(refreshButton).toBeInTheDocument()

    const createNewFolderButton = screen.getByTestId('assets-panel-create-new-folder-button')
    // @ts-ignore
    expect(createNewFolderButton).toBeInTheDocument()

    const breadCrumbs = screen.getByTestId('assets-panel-breadcrumbs')
    // @ts-ignore
    expect(breadCrumbs).toBeInTheDocument()
  })

  it('should render a pop up menu with view options for `Assets` that have data-testid attributes when the view options button is clicked', () => {
    const panelToolBar = screen.getByTestId('assets-panel-top-bar')
    // @ts-ignore
    expect(panelToolBar).toBeInTheDocument()

    const viewOptionsButton = screen.getByTestId('view-options-button')
    fireEvent.click(viewOptionsButton)

    const filesPanelViewOptionsIconSizeValueInputGroup = screen.getByTestId(
      'files-panel-view-options-icon-size-value-input-group'
    )
    // @ts-ignore
    expect(filesPanelViewOptionsIconSizeValueInputGroup).toBeInTheDocument()

    const sliderTextValueInput = screen.getByTestId('slider-text-value-input')
    // @ts-ignore
    expect(sliderTextValueInput).toBeInTheDocument()

    const sliderDraggableValueInput = screen.getByTestId('slider-draggable-value-input')
    // @ts-ignore
    expect(sliderDraggableValueInput).toBeInTheDocument()
  })
})
