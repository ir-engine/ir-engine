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
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEngine, destroyEngine } from '@ir-engine/ecs/src/Engine'
import React from 'react'
import Topbar from './topbar'

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

describe('Topbar component', () => {
  beforeEach(() => {
    createEngine()
    render(<Topbar />)
  })

  afterEach(() => {
    destroyEngine()
    cleanup()
  })

  it('should render an `Assets` toolbar element with the data-testid attribute "assets-panel-top-bar"', () => {
    const panelToolBar = screen.getByTestId('assets-panel-top-bar')
    expect(panelToolBar).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "assets-panel-refresh-button"', () => {
    const refreshButton = screen.getByTestId('assets-panel-refresh-button')
    expect(refreshButton).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "assets-panel-create-new-folder-button"', () => {
    const createNewFolderButton = screen.getByTestId('assets-panel-create-new-folder-button')
    expect(createNewFolderButton).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "assets-panel-breadcrumbs"', () => {
    const breadCrumbs = screen.getByTestId('assets-panel-breadcrumbs')
    expect(breadCrumbs).toBeInTheDocument()
  })

  it('should render an element with the data-testid attribute "view-options-button"', () => {
    const viewOptionsButton = screen.getByTestId('view-options-button')
    expect(viewOptionsButton).toBeInTheDocument()
  })

  it('should render a pop up menu with icon view options for `Assets` that had an element with the data-testid attribute "files-panel-view-options-icon-size-value-input-group"', () => {
    const viewOptionsButton = screen.getByTestId('view-options-button')
    fireEvent.click(viewOptionsButton)

    const filesPanelViewOptionsIconSizeValueInputGroup = screen.getByTestId(
      'files-panel-view-options-icon-size-value-input-group'
    )
    expect(filesPanelViewOptionsIconSizeValueInputGroup).toBeInTheDocument()
  })

  it('should render a pop up menu with icon view options for `Assets` that had an element with the data-testid attribute "slider-text-value-input"', () => {
    const viewOptionsButton = screen.getByTestId('view-options-button')
    fireEvent.click(viewOptionsButton)

    const sliderTextValueInput = screen.getByTestId('slider-text-value-input')
    expect(sliderTextValueInput).toBeInTheDocument()
  })

  it('should render a pop up menu with icon view options for `Assets` that had an element with the data-testid attribute "slider-draggable-value-input"', () => {
    const viewOptionsButton = screen.getByTestId('view-options-button')
    fireEvent.click(viewOptionsButton)

    const sliderDraggableValueInput = screen.getByTestId('slider-draggable-value-input')
    expect(sliderDraggableValueInput).toBeInTheDocument()
  })
})
