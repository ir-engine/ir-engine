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
  createEntity,
  EntityTreeComponent,
  generateEntityUUID,
  getComponent,
  getOptionalComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { AnimationMixer } from 'three'
import { vi } from 'vitest'
import { AnimationComponent } from '../../src/avatar/components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../../src/avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../src/avatar/components/AvatarComponent'

import { setupMixamoAnimation } from '../../src/avatar/systems/AvatarAnimationSystem'
import { GLTFComponent } from '../../src/gltf/GLTFComponent'

export const createTestGLTFEntity = () => {
  const parent = createEntity()
  setComponent(parent, EntityTreeComponent)
  setComponent(parent, UUIDComponent, generateEntityUUID())
  const entity = createEntity()
  setComponent(entity, EntityTreeComponent, { parentEntity: parent })
  return entity
}

export const default_url = 'packages/projects/default-project/assets'
export const rings_gltf = default_url + '/rings.glb'
export const animation_pack = default_url + '/animations/emotes.glb'
export const vrm = default_url + '/avatars/male_01.vrm'

/**Used to mock non user networked animated avatars */
export const mockAnimatedAvatar = async () => {
  const animationPackEntity = createTestGLTFEntity()

  setComponent(animationPackEntity, UUIDComponent, generateEntityUUID())
  setComponent(animationPackEntity, GLTFComponent, { src: animation_pack })
  setComponent(animationPackEntity, NameComponent, 'animationPack')

  const vrmEntity = createTestGLTFEntity()

  setComponent(vrmEntity, UUIDComponent, generateEntityUUID())
  setComponent(vrmEntity, GLTFComponent, { src: vrm })
  setComponent(vrmEntity, AvatarRigComponent)
  setComponent(vrmEntity, AvatarAnimationComponent)
  setComponent(vrmEntity, AvatarComponent)

  //extra wait for animation component to prevent race conditions
  await vi.waitUntil(
    () => {
      return (
        getOptionalComponent(animationPackEntity, AnimationComponent) &&
        getOptionalComponent(vrmEntity, AvatarRigComponent)?.vrm?.scene
      )
    },
    { timeout: 20000 }
  )

  setupMixamoAnimation(animationPackEntity)

  setComponent(vrmEntity, AnimationComponent, {
    animations: getComponent(animationPackEntity, AnimationComponent).animations,
    mixer: new AnimationMixer(getComponent(vrmEntity, AvatarRigComponent).vrm.scene)
  })

  return vrmEntity
}
