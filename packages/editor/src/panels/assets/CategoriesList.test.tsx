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

import React from 'react'
import { EditorState } from '../../services/EditorServices'
import { FilesState } from '../../services/FilesState'
import CategoriesList from './categories'

function CategoriesListTestWrapper() {
  const [selected, setSelected] = React.useState<string | undefined>(undefined)

  const handleClick = (category?: string) => {
    setSelected(category)
  }

  return <CategoriesList selected={selected} onClick={handleClick} />
}

describe('CategoriesList component', () => {
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
              merge: vi.fn()
            }
          }
          return {}
        })
      }
    })

    vi.mock('./hooks', () => ({
      assetCategories: [
        {
          name: 'Category 1',
          path: '/mock-category-1',
          depth: 0,
          children: [
            {
              name: 'Subcategory A',
              path: '/sub-cat-a',
              depth: 1,
              children: []
            },
            {
              name: 'Subcategory B',
              path: '/sub-cat-b',
              depth: 1,
              children: []
            }
          ]
        },
        {
          name: 'Category 2',
          path: '/mock-category-2',
          depth: 0,
          children: [
            {
              name: 'Subcategory C',
              path: '/sub-cat-c',
              depth: 1,
              children: []
            }
          ]
        }
      ],
      useAssetsCategory: vi.fn().mockReturnValue({
        currentCategoryPath: { set: vi.fn() },
        sidebarWidth: {
          value: 300,
          set: vi.fn()
        }
      }),
      useAssetsQuery: vi.fn().mockReturnValue({
        refetchResources: vi.fn(),
        staticResourcesPagination: {
          skip: { set: vi.fn() }
        }
      })
    }))
  })

  beforeEach(() => {
    render(<CategoriesListTestWrapper />)
  })

  afterEach(() => {
    cleanup()
  })

  it('should render a button with data-testid "assets-tab-assets-section-button"', () => {
    const assetTabAssetsSectionButton = screen.getByTestId('assets-tab-assets-section-button')

    // @ts-ignore
    expect(assetTabAssetsSectionButton).toBeInTheDocument()
  })

  it('should render a button with data-testid "assets-tab-files-section-button"', () => {
    const assetTabFilesSectionButton = screen.getByTestId('assets-tab-files-section-button')

    // @ts-ignore
    expect(assetTabFilesSectionButton).toBeInTheDocument()
  })

  it('should render a list of asset categories with data-testid attributes', async () => {
    const assetTabAssetsSectionButton = screen.getByTestId('assets-tab-assets-section-button')
    fireEvent.click(assetTabAssetsSectionButton)

    const assetCategoryList = screen.getByTestId('assets-category-list')
    // @ts-ignore
    expect(assetCategoryList).toBeInTheDocument()

    const assetCategoryContainer = await screen.findAllByTestId('assets-panel-category')
    expect(assetCategoryContainer.length).toBeGreaterThan(0)

    const assetCategoryNames = await screen.findAllByTestId('item-name')
    expect(assetCategoryNames.length).toBeGreaterThan(0)
  })
})
