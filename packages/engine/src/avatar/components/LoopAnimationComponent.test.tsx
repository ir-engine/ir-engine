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

import {
  createEngine,
  destroyEngine,
  EntityID,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { afterEach, assert, beforeEach, describe, it, vi } from 'vitest'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'

import { createTestGLTFEntity, rings_gltf } from '../../../tests/avatar/mockAnimatedAvatar'
import { startEngineReactor } from '../../../tests/startEngineReactor'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { LoopAnimationComponent } from './LoopAnimationComponent'

describe('LoopAnimationComponent', () => {
  describe('Animation is started/stopped', () => {
    overrideFileLoaderLoad()

    beforeEach(() => {
      createEngine()
      startEngineReactor()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('Should start animation when index is set', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      await vi.waitFor(
        () => {
          return GLTFComponent.isSceneLoaded(entity)
        },
        { timeout: 20000, interval: 100 }
      )

      setComponent(entity, LoopAnimationComponent, {
        activeClipIndex: 0
      })

      await vi.waitFor(() => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        assert(!!loopAnimationComponent._action)
        assert(loopAnimationComponent._action.isRunning())
      })
    })

    it('Should stop animation when index is set to -1', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      await vi.waitFor(
        () => {
          return GLTFComponent.isSceneLoaded(entity)
        },
        { timeout: 20000 }
      )

      setComponent(entity, LoopAnimationComponent, {
        activeClipIndex: 0
      })

      await vi.waitFor(() => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        assert(!!loopAnimationComponent._action)
        assert(loopAnimationComponent._action.isRunning())
      })
    })

    it('Should stop animation when index is set to -1', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      await vi.waitFor(
        () => {
          return GLTFComponent.isSceneLoaded(entity)
        },
        { timeout: 20000 }
      )

      setComponent(entity, LoopAnimationComponent, {
        activeClipIndex: 0
      })

      await vi.waitFor(() => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        assert(!!loopAnimationComponent._action)
        assert(loopAnimationComponent._action.isRunning())
      })

      const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
      const action = loopAnimationComponent._action
      assert(!!action)
      assert(action.isRunning())

      setComponent(entity, LoopAnimationComponent, {
        activeClipIndex: -1
      })

      await vi.waitFor(() => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        assert(loopAnimationComponent._action === null)
        assert(action.isRunning() === false)
      })
    })

    it('Should stop animation when the component is removed', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      await vi.waitFor(
        () => {
          return GLTFComponent.isSceneLoaded(entity)
        },
        { timeout: 20000 }
      )

      setComponent(entity, LoopAnimationComponent, {
        activeClipIndex: 0
      })

      const action = await vi.waitFor(() => {
        const loopAnimationComponent = getComponent(entity, LoopAnimationComponent)
        const action = loopAnimationComponent._action
        assert(!!action)
        assert(action.isRunning())
        return action
      })

      removeComponent(entity, LoopAnimationComponent)

      await vi.waitFor(() => {
        assert(hasComponent(entity, LoopAnimationComponent) === false)
        assert(action.isRunning() === false)
      })
    })
  })
})
