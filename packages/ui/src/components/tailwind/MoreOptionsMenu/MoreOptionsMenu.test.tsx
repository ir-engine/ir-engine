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

  it('should render a list with options that have data-testid attributes that match the labels', () => {
    const moreOptionsButton = screen.getByTestId('more-options-button')
    fireEvent.click(moreOptionsButton)

    const moreOptionsList = screen.getByTestId('more-options-list')
    expect(moreOptionsList).toBeInTheDocument()

    const shareProjectOption = screen.getByTestId('share-project-button')
    expect(shareProjectOption).toBeInTheDocument()

    const deleteProjectOption = screen.getByTestId('delete-project-button')
    expect(deleteProjectOption).toBeInTheDocument()

    const renameOption = screen.getByTestId('rename-button')
    expect(renameOption).toBeInTheDocument()

    const deleteOption = screen.getByTestId('delete-button')
    expect(deleteOption).toBeInTheDocument()
  })
})
