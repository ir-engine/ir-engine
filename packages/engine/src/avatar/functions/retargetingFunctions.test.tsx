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

import {
  createEngine,
  createEntity,
  destroyEngine,
  generateEntityUUID,
  getComponent,
  getOptionalComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { applyIncomingActions } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { EntityTreeComponent, traverseEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { render } from '@testing-library/react'
import React from 'react'
import { afterEach, assert, beforeEach, describe, expect, it, vi } from 'vitest'
import { overrideFileLoaderLoad } from '../../../tests/util/loadGLTFAssetNode'
import { GLTFComponent } from '../../gltf/GLTFComponent'
import { mixamoVRMRigMap } from '../AvatarBoneMatching'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { retargetAnimationClips } from './retargetingFunctions'

const setupEntity = () => {
  const parent = createEntity()
  setComponent(parent, SceneComponent)
  setComponent(parent, EntityTreeComponent)
  setComponent(parent, UUIDComponent, generateEntityUUID())
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  return entity
}

const default_url = 'packages/projects/default-project/assets'
const animation_pack = default_url + '/animations/emotes.glb'

describe('retargetingFunctions', () => {
  describe('retargetAnimationClips', () => {
    overrideFileLoaderLoad()

    beforeEach(() => {
      createEngine()
    })

    afterEach(() => {
      return destroyEngine()
    })

    it('should bind animation tracks to rig entities based on VRM schema', async () => {
      const entity = setupEntity()

      setComponent(entity, UUIDComponent, generateEntityUUID())
      setComponent(entity, GLTFComponent, { src: animation_pack })
      setComponent(entity, NameComponent, 'animationPack')

      const { rerender, unmount } = render(<></>)
      applyIncomingActions()
      //extra wait for animation component to prevent race conditions
      await vi.waitFor(
        () => {
          expect(getOptionalComponent(entity, AnimationComponent)).toBeTruthy()
        },
        { timeout: 20000 }
      )

      setComponent(entity, AvatarRigComponent)
      traverseEntityNode(entity, (child) => {
        const name = getComponent(child, NameComponent).replace(':', '')
        if (mixamoVRMRigMap[name]) AvatarRigComponent.setBone(entity, child, mixamoVRMRigMap[name])
      })

      retargetAnimationClips(entity)

      const rig = getComponent(entity, AvatarRigComponent).bonesToEntities
      for (const clip of getComponent(entity, AnimationComponent).animations) {
        for (const track of clip.tracks) {
          assert.equal(!!rig[track.name.split('.')[0]], true)
        }
      }

      unmount()
    })
  })
})
