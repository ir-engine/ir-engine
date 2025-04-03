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

import { cleanup, fireEvent, render, screen, type RenderResult } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi, type TestContext } from 'vitest'
import { EditorState } from '../../services/EditorServices'

import React from 'react'
import { FilesState, FilesViewModeSettings, FilesViewModeState } from '../../services/FilesState'
import FilesToolbar from './toolbar'

interface FilesToolbarContext extends TestContext {
  rerender: RenderResult['rerender']
}

const dynamicViewMode = {
  _value: 'icons',
  get value() {
    return this._value
  },
  set: vi.fn((newVal) => {
    dynamicViewMode._value = newVal
  })
}

describe('FilesToolbar component', () => {
  beforeAll(() => {
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
        useHookstate: vi.fn().mockReturnValue({
          value: false,
          set: vi.fn()
        }),

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
              icons: FilesViewModeSettings.initial.icons,
              list: FilesViewModeSettings.initial.list
            }
          } else if (stateDef === FilesViewModeState) {
            return {
              viewMode: {
                value: dynamicViewMode.value
              }
            }
          }
          return {}
        })
      }
    })

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
  beforeEach<FilesToolbarContext>((context) => {
    const { rerender } = render(<FilesToolbar />)
    context.rerender = rerender
  })

  afterEach(() => {
    cleanup()
  })

  it('should render an `Files` toolbar with various elements that have relevant data-testid attributes', () => {
    const filesPanelTopBar = screen.getByTestId('files-panel-top-bar')
    // @ts-ignore
    expect(filesPanelTopBar).toBeInTheDocument()

    const refreshButton = screen.getByTestId('files-panel-refresh-directory-button')
    // @ts-ignore
    expect(refreshButton).toBeInTheDocument()

    const createNewFolderButton = screen.getByTestId('files-panel-create-new-folder-button')
    // @ts-ignore
    expect(createNewFolderButton).toBeInTheDocument()

    const viewOptionsButton = screen.getByTestId('view-options-button')
    // @ts-ignore
    expect(viewOptionsButton).toBeInTheDocument()

    const downloadProjectButton = screen.getByTestId('files-panel-download-project-button')
    // @ts-ignore
    expect(downloadProjectButton).toBeInTheDocument()

    const viewModeListButton = screen.getByTestId('files-panel-view-mode-list-button')
    // @ts-ignore
    expect(viewModeListButton).toBeInTheDocument()

    const viewModeIconsButton = screen.getByTestId('files-panel-view-mode-icons-button')
    // @ts-ignore
    expect(viewModeIconsButton).toBeInTheDocument()

    const uploadFilesButton = screen.getByTestId('files-panel-upload-files-button')
    // @ts-ignore
    expect(uploadFilesButton).toBeInTheDocument()

    const uploadFolderButton = screen.getByTestId('files-panel-upload-folder-button')
    // @ts-ignore
    expect(uploadFolderButton).toBeInTheDocument()

    const searchBar = screen.getByTestId('files-panel-search-input')
    // @ts-ignore
    expect(searchBar).toBeInTheDocument()
  })

  it('should render a pop up menu with view options for `Files` that have data-testid attributes when the view options button is clicked', (context: FilesToolbarContext) => {
    const filesPanelTopBar = screen.getByTestId('files-panel-top-bar')
    // @ts-ignore
    expect(filesPanelTopBar).toBeInTheDocument()

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

    const viewModeListButton = screen.getByTestId('files-panel-view-mode-list-button')
    fireEvent.click(viewModeListButton)

    dynamicViewMode.set('list')
    context.rerender(<FilesToolbar />)

    const listOptionsColumnName = screen.getByTestId('files-panel-view-mode-list-options-column-name')
    // @ts-ignore
    expect(listOptionsColumnName).toBeInTheDocument()

    const listOptionsColumnType = screen.getByTestId('files-panel-view-mode-list-options-column-type')
    // @ts-ignore
    expect(listOptionsColumnType).toBeInTheDocument()

    const listOptionsColumnAuthor = screen.getByTestId('files-panel-view-mode-list-options-column-author')
    // @ts-ignore
    expect(listOptionsColumnAuthor).toBeInTheDocument()

    const listOptionsColumnCreatedAt = screen.getByTestId('files-panel-view-mode-list-options-column-createdAt')
    // @ts-ignore
    expect(listOptionsColumnCreatedAt).toBeInTheDocument()

    const listOptionsColumnStatistics = screen.getByTestId('files-panel-view-mode-list-options-column-statistics')
    // @ts-ignore
    expect(listOptionsColumnStatistics).toBeInTheDocument()

    const listOptionsColumnSize = screen.getByTestId('files-panel-view-mode-list-options-column-size')
    // @ts-ignore
    expect(listOptionsColumnSize).toBeInTheDocument()
  })
})
