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

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createEngine, destroyEngine } from '@ir-engine/ecs'
import React from 'react'
import { DndWrapper } from '../../components/dnd/DndWrapper'
import Resources from './resources'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

vi.mock('./hooks', () => ({
  useAssetsCategory: vi.fn().mockReturnValue({
    sidebarWidth: {
      value: 300,
      set: vi.fn()
    }
  }),
  AssetsRefreshState: {
    triggerRefresh: vi.fn()
  },
  useAssetsQuery: vi.fn().mockReturnValue({
    category: { currentCategoryPath: { set: vi.fn(), get: vi.fn().mockReturnValue('') } },
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

describe('Resources component', () => {
  beforeEach(() => {
    createEngine()
    render(
      <div id="test-dnd-context">
        <DndWrapper id="test-dnd-context">
          <Resources />
        </DndWrapper>
      </div>
    )
  })

  afterEach(() => {
    cleanup()
    destroyEngine()
  })

  it('should render a group of resource components with relevant data-testid attributes', async () => {
    const itemsContainer = screen.getByTestId('assets-panel-resource-items-container')
    expect(itemsContainer).toBeInTheDocument()
  })

  it('should render a container element of resource items that has the data-testid "assets-panel-resource-items"', async () => {
    const resourceItems = await screen.findAllByTestId('assets-panel-resource-items')
    expect(resourceItems.length).toBeGreaterThan(0)
  })

  it('should render resource file elements that have the data-testid attribute "assets-panel-resource-file"', async () => {
    const resourceFiles = await screen.findAllByTestId('assets-panel-resource-file')
    expect(resourceFiles.length).toBeGreaterThan(0)
  })

  it('should render resource file icon elements that have the data-testid attribute "assets-panel-resource-file-icon"', async () => {
    const resourceIcons = await screen.findAllByTestId('assets-panel-resource-file-icon')
    expect(resourceIcons.length).toBeGreaterThan(0)
  })

  it('should render resource file name elements that have the data-testid attribute "assets-panel-resource-file-name"', async () => {
    const resourceFileNames = await screen.findAllByTestId('assets-panel-resource-file-name')
    expect(resourceFileNames.length).toBeGreaterThan(0)
  })
})
