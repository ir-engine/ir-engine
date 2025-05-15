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
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import React from 'react'
import MoreOptionsMenu from './index'

describe('MoreOptionsMenu component', () => {
  beforeEach(() => {
    render(
      <MoreOptionsMenu
        actionProps={[
          {
            label: 'Share Project',
            onClick: () => {}
          },
          {
            label: 'Delete Project',
            onClick: () => {}
          },
          {
            label: 'Rename',
            onClick: () => {}
          },
          {
            label: 'Delete',
            onClick: () => {}
          }
        ]}
      />
    )
  })

  afterEach(() => {
    cleanup()
  })

  it('should render a button with data-testid "more-options-button"', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    expect(moreOptionsButton).toBeInTheDocument()
  })

  it('should render a list container element with the data-testid attribute "more-options-list" after the "more options button" is clicked', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const moreOptionsList = screen.getByTestId('more-options-list')
    expect(moreOptionsList).toBeInTheDocument()
  })
  it('should render a "share project" button with the data-testid attribute "share-project-button" after the "more options button" is clicked', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const shareProjectOption = screen.getByTestId('share-project-button')
    expect(shareProjectOption).toBeInTheDocument()
  })

  it('should render a "delete project" button with the data-testid attribute "delete-project-button" after the "more options button" is clicked', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const deleteProjectOption = screen.getByTestId('delete-project-button')
    expect(deleteProjectOption).toBeInTheDocument()
  })

  it('should render a "rename project" button with the data-testid attribute "rename-button" after the "more options button" is clicked', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const renameOption = screen.getByTestId('rename-button')
    expect(renameOption).toBeInTheDocument()
  })

  it('should render a "delete" button with the data-testid attribute "delete-button" after the "more options button" is clicked', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const deleteOption = screen.getByTestId('delete-button')
    expect(deleteOption).toBeInTheDocument()
  })
})
