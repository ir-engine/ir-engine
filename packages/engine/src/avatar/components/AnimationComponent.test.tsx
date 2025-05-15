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
  getOptionalComponent,
  hasComponent,
  iterateEntityNode,
  setComponent,
  SourceID,
  UUIDComponent
} from '@ir-engine/ecs'
import { TransformComponent } from '@ir-engine/spatial'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { AnimationComponent } from './AnimationComponent'
import { AvatarRigComponent } from './AvatarAnimationComponent'

import { createTestGLTFEntity, mockAnimatedAvatar, rings_gltf } from '../../../tests/avatar/mockAnimatedAvatar'
import { startEngineReactor } from '../../../tests/startEngineReactor'

describe('AnimationComponent', () => {
  describe('ECS PropertyBinding', () => {
    overrideFileLoaderLoad()

    beforeEach(() => {
      createEngine()
      startEngineReactor()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should bind animation tracks to entities based on node id sourced from entity UUIDs', async () => {
      const entity = createTestGLTFEntity()

      setComponent(entity, UUIDComponent, {
        entitySourceID: 'source' as SourceID,
        entityID: 'test' as EntityID
      })
      setComponent(entity, GLTFComponent, { src: rings_gltf })

      //extra wait for animation component to prevent race conditions
      await vi.waitFor(
        () => {
          expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
        },
        { timeout: 20000 }
      )
      const startingFlatQuaternions = [] as number[]
      iterateEntityNode(entity, (e) => {
        if (hasComponent(e, MeshComponent))
          startingFlatQuaternions.push(...getComponent(e, TransformComponent).rotation.toArray())
      })

      const animationComponent = getComponent(entity, AnimationComponent)
      animationComponent.mixer.clipAction(animationComponent.animations[0]).play()
      animationComponent.mixer.update(0.1)

      const animatedFlatQuaternions = [] as number[]
      iterateEntityNode(entity, (e) => {
        if (hasComponent(e, MeshComponent))
          animatedFlatQuaternions.push(...getComponent(e, TransformComponent).rotation.toArray())
      })

      //quaternions update as a side effect of successful animation binding, so assert that they've changed
      for (let i = 0; i < startingFlatQuaternions.length / 4; i++) {
        const startX = startingFlatQuaternions[i]
        const startY = startingFlatQuaternions[i + 1]
        const startZ = startingFlatQuaternions[i + 2]
        const startW = startingFlatQuaternions[i + 3]
        const animatedX = animatedFlatQuaternions[i]
        const animatedY = animatedFlatQuaternions[i + 1]
        const animatedZ = animatedFlatQuaternions[i + 2]
        const animatedW = animatedFlatQuaternions[i + 3]
        assert(startX + startY + startZ + startW !== animatedX + animatedY + animatedZ + animatedW)
      }
    })

    it('should bind animation tracks to rig entities based on VRM schema', async () => {
      const vrmEntity = await mockAnimatedAvatar()

      const rig = getComponent(vrmEntity, AvatarRigComponent).entitiesToBones

      const startRigQuaternions = [] as number[]
      for (const bone in rig) {
        if (hasComponent(rig[bone], TransformComponent))
          startRigQuaternions.push(...getComponent(rig[bone], TransformComponent).rotation.toArray())
      }

      const animationComponent = getComponent(vrmEntity, AnimationComponent)
      animationComponent.mixer.clipAction(animationComponent.animations[0]).play()
      animationComponent.mixer.update(0.1)

      const animatedRigQuaternions = [] as number[]
      for (const bone in rig) {
        if (hasComponent(rig[bone], TransformComponent))
          animatedRigQuaternions.push(...getComponent(rig[bone], TransformComponent).rotation.toArray())
      }

      for (let i = 0; i < startRigQuaternions.length / 4; i++) {
        const startX = startRigQuaternions[i]
        const startY = startRigQuaternions[i + 1]
        const startZ = startRigQuaternions[i + 2]
        const startW = startRigQuaternions[i + 3]
        const animatedX = animatedRigQuaternions[i]
        const animatedY = animatedRigQuaternions[i + 1]
        const animatedZ = animatedRigQuaternions[i + 2]
        const animatedW = animatedRigQuaternions[i + 3]
        assert(startX + startY + startZ + startW !== animatedX + animatedY + animatedZ + animatedW)
      }
      // unmount()
    })
  })
})
