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
import { GLTF } from '@gltf-transform/core'
import {
  createEngine,
  createEntity,
  destroyEngine,
  EngineState,
  Entity,
  EntityID,
  EntityTreeComponent,
  Layers,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { EditorState } from '@ir-engine/editor/src/services/EditorServices'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { AssetState } from '@ir-engine/engine/src/gltf/GLTFState'
import { startEngineReactor } from '@ir-engine/engine/tests/startEngineReactor'
import { getMutableState, UserID } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial'
import { Physics } from '@ir-engine/spatial/src/physics/classes/Physics'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { mockSpatialEngine } from '@ir-engine/spatial/tests/util/mockSpatialEngine'
import { act, cleanup, render } from '@testing-library/react'
import React from 'react'
import { Cache } from 'three'
import { afterEach, beforeEach, describe, vi } from 'vitest'
import { DndWrapper } from '../../../../editor/src/components/dnd/DndWrapper'
import { HierarchyPanelTab } from './index'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

vi.mock('@ir-engine/common/src/utils/FeathersHooks', () => ({
  useService: () => ({
    find: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue({})
  }),
  useFind: () => ({
    data: [],
    isLoading: false
  }),
  default: vi.fn()
}))

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

const waitForScene = (entity: Entity) => vi.waitUntil(() => GLTFComponent.isSceneLoaded(entity), { timeout: 5000 })

describe.skip('HierarchyPanel component', () => {
  let physicsWorldEntity: Entity
  let rootEntity: Entity

  beforeEach(async (context) => {
    Cache.enabled = true
    createEngine()
    getMutableState(EngineState).isEditing.set(true)
    getMutableState(EngineState).userID.set('user' as UserID)
    mockSpatialEngine()
    await Physics.load()
    physicsWorldEntity = createEntity()
    setComponent(physicsWorldEntity, UUIDComponent, {
      entitySourceID: 'source' as SourceID,
      entityID: 'physics' as EntityID
    })
    setComponent(physicsWorldEntity, SceneComponent)
    setComponent(physicsWorldEntity, TransformComponent)
    setComponent(physicsWorldEntity, EntityTreeComponent)
    const physicsWorld = Physics.createWorld(physicsWorldEntity)
    physicsWorld.timestep = 1 / 60

    startEngineReactor()

    const nodeID = 'node1ID' as EntityID

    const gltf: GLTF.IGLTF = {
      asset: {
        version: '2.0'
      },
      scenes: [{ nodes: [0] }],
      scene: 0,
      nodes: [
        {
          name: 'node',
          extensions: {
            [UUIDComponent.jsonID!]: nodeID as any
          }
        }
      ]
    }

    Cache.add('/test.gltf', gltf)
    rootEntity = AssetState.load('/test.gltf', undefined, physicsWorldEntity, Layers.Authoring)
    getMutableState(EditorState).rootEntity.set(rootEntity)
    getMutableState(EditorState).scenePath.set('/test.gltf')
    getMutableState(EditorState).sceneAssetID.set('/test.gltf')

    await waitForScene(rootEntity)

    await act(() => {
      render(
        <div id="test-dnd-context">
          <DndWrapper id="test-dnd-context">
            {/* @ts-expect-error */}
            {HierarchyPanelTab.content}
          </DndWrapper>
        </div>
      )
    })
  })

  afterEach(() => {
    Cache.enabled = false
    destroyEngine()
    cleanup()
  })

  // it('should render a top bar element with the data-testid attribute "hierarchy-panel-topbar"', async () => {
  //   const topBar = screen.getByTestId('hierarchy-panel-top-bar')
  //   expect(topBar).toBeInTheDocument()
  // })

  // it('should render a top bar element with the data-testid attribute "search-input"', async () => {
  //   const searchInput = screen.getByTestId('search-input')
  //   expect(searchInput).toBeInTheDocument()
  // })

  // it('should render a top bar element with the data-testid attribute "hierarchy-panel-add-entity-button"', async () => {
  //   const addEntityButton = screen.getByTestId('hierarchy-panel-add-entity-button')
  //   expect(addEntityButton).toBeInTheDocument()
  // })

  // it('should render a top bar element with the data-testid attribute "hierarchy-panel-scene-item-list"', async () => {
  //   const sceneItemList = screen.getByTestId('hierarchy-panel-scene-item-list')
  //   expect(sceneItemList).toBeInTheDocument()
  // })

  // it('should render a top bar element with the data-testid attribute "hierarchy-panel-scene-item"', async () => {
  //   const sceneItems = await screen.findAllByTestId('hierarchy-panel-scene-item')
  //   expect(sceneItems.length).toBeGreaterThan(0)
  // })

  // it('should render a top bar element with the data-testid attribute "hierarchy-panel-scene-item-collapse-button"', async () => {
  //   const sceneItem = screen.getByTestId('hierarchy-panel-scene-item-collapse-button')
  //   expect(sceneItem).toBeInTheDocument()
  // })

  // it('should render a top bar element with the data-testid attribute "hierarchy-panel-scene-item-icon"', async () => {
  //   const sceneItemIcons = await screen.findAllByTestId('hierarchy-panel-scene-item-icon')
  //   expect(sceneItemIcons.length).toBeGreaterThan(0)
  // })

  // it('should render a top bar element with the data-testid attribute "hierarchy-panel-scene-item-name"', async () => {
  //   const sceneItemNames = await screen.findAllByTestId('hierarchy-panel-scene-item-name')
  //   expect(sceneItemNames.length).toBeGreaterThan(0)
  // })

  // it('should render a top bar element with the data-testid attribute "hierarchy-panel-scene-item-lock-button" by default', async () => {
  //   const sceneItemLockButtons = await screen.findAllByTestId('hierarchy-panel-scene-item-lock-button')
  //   expect(sceneItemLockButtons.length).toBeGreaterThan(0)
  // })

  // it('should render a top bar element with the data-testid attribute "hierarchy-panel-scene-item-unlock-button" when lock icon is clicked', async () => {
  //   const sceneItemLockButtons = await screen.findAllByTestId('hierarchy-panel-scene-item-lock-button')
  //   expect(sceneItemLockButtons.length).toBeGreaterThan(0)

  //   fireEvent.click(sceneItemLockButtons[0])

  //   const sceneItemUnlockButtons = await screen.findAllByTestId('hierarchy-panel-scene-item-unlock-button')
  //   expect(sceneItemUnlockButtons.length).toBeGreaterThan(0)
  // })

  // it('should render a top bar element with the data-testid attribute "hierarchy-panel-scene-item-hide-button"', async () => {
  //   const sceneItemLockButton = screen.getByTestId('hierarchy-panel-scene-item-hide-button')
  //   expect(sceneItemLockButton).toBeInTheDocument()
  // })
})
