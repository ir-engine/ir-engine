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

import { AnimationMixer, Group, LoopOnce } from 'three'

import { setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { createEntity } from '@ir-engine/ecs/src/EntityFunctions'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { addObjectToGroup, removeObjectFromGroup } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'

import { getGLTFAsync } from '../../assets/functions/resourceLoaderHooks'
import { DomainConfigState } from '../../assets/state/DomainConfigState'
import { SkeletonUtils } from '../SkeletonUtils'
import { AvatarControllerType, AvatarInputSettingsState } from '../state/AvatarInputSettingsState'
import { XRHandMeshModel } from './XRHandMeshModel'

export const initializeControllerModel = async (entity: Entity, handedness: string) => {
  const avatarInputState = getMutableState(AvatarInputSettingsState)
  const avatarInputControllerType = avatarInputState.controlType.value
  if (avatarInputControllerType !== AvatarControllerType.OculusQuest) return

  const [gltf] = await getGLTFAsync(
    `${
      getState(DomainConfigState).cloudDomain
    }/projects/ir-engine/default-project/assets/controllers/${handedness}_controller.glb`
  )
  let handMesh = gltf?.scene?.children[0]

  if (!handMesh) {
    console.error(`Could not load mesh`)
    return
  }

  handMesh = SkeletonUtils.clone(handMesh)

  const controller = new Group()
  controller.name = `controller-model-${entity}`
  const controllerEntity = createEntity()
  setComponent(controllerEntity, NameComponent, controller.name)
  setComponent(controllerEntity, EntityTreeComponent, { parentEntity: entity })
  addObjectToGroup(controllerEntity, controller)

  if (controller.userData.mesh) {
    removeObjectFromGroup(controllerEntity, controller.userData.mesh)
  }

  controller.userData.mesh = handMesh
  addObjectToGroup(controllerEntity, controller.userData.mesh)
  controller.userData.handedness = handedness

  const winding = handedness == 'left' ? 1 : -1
  controller.userData.mesh.rotation.x = Math.PI * 0.25
  controller.userData.mesh.rotation.y = Math.PI * 0.5 * winding
  controller.userData.mesh.rotation.z = Math.PI * 0.02 * -winding
}

export const initializeHandModel = async (entity: Entity, handedness: string) => {
  const avatarInputState = getMutableState(AvatarInputSettingsState)
  const avatarInputControllerType = avatarInputState.controlType.value

  // if is hands and 'none' type enabled (instead we use IK to move hands in avatar model)
  if (avatarInputControllerType === AvatarControllerType.None) return

  const [gltf] = await getGLTFAsync(
    `${getState(DomainConfigState).cloudDomain}/projects/ir-engine/default-project/assets/controllers/${handedness}.glb`
  )
  const handMesh = gltf?.scene?.children[0]

  const controller = new Group()
  controller.name = `controller-hand-model-${entity}`
  const controllerEntity = createEntity()
  setComponent(controllerEntity, NameComponent, controller.name)
  setComponent(controllerEntity, EntityTreeComponent, { parentEntity: entity })
  addObjectToGroup(controllerEntity, controller)

  if (controller.userData.mesh) {
    removeObjectFromGroup(controllerEntity, controller.userData.mesh)
  }

  controller.userData.mesh = new XRHandMeshModel(entity, controller, handMesh!, handedness)
  addObjectToGroup(controllerEntity, controller.userData.mesh)
  controller.userData.handedness = handedness

  if (gltf?.animations?.length) {
    controller.userData.animations = gltf.animations
  }

  const animations = controller.userData.animations
  const mixer = new AnimationMixer(controller.userData.mesh)
  const fistAction = mixer.clipAction(animations[0])
  fistAction.loop = LoopOnce
  fistAction.clampWhenFinished = true
  controller.userData.mixer = mixer
  controller.userData.actions = [fistAction]
}
