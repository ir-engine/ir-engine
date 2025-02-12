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

import { Quaternion, Vector3 } from 'three'

import { getComponent, getOptionalComponent, hasComponent, setComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { AnimationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getState } from '@ir-engine/hyperflux'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { AvatarRigComponent } from '../../avatar/components/AvatarAnimationComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { NormalizedBoneComponent } from '../../avatar/components/NormalizedBoneComponent'
import { MotionCapturePoseComponent } from '../../mocap/MotionCapturePoseComponent'
import { MotionCaptureRigComponent } from '../../mocap/MotionCaptureRigComponent'
import { MountPointComponent } from '../../scene/components/MountPointComponent'
import { SittingComponent } from '../../scene/components/SittingComponent'
import { InteractableState } from '../functions/interactableFunctions'

const sittingIdleQuery = defineQuery([SittingComponent])

const execute = () => {
  if (getState(EngineState).isEditing) return
  const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()

  /*Consider mocap inputs in the event we want to snap a real world seated person
    to a mount point, to maintain physical continuity
  */
  const mocapInputSource = getOptionalComponent(selfAvatarEntity, MotionCapturePoseComponent)
  if (mocapInputSource) {
    if (mocapInputSource.sitting?.begun)
      MountPointComponent.mountEntity(selfAvatarEntity, getState(InteractableState).available[0])
    if (mocapInputSource.standing?.begun) MountPointComponent.unmountEntity(selfAvatarEntity)
  }

  for (const entity of sittingIdleQuery()) {
    const controller = getComponent(entity, AvatarControllerComponent)
    if (controller.gamepadLocalInput.lengthSq() > 0.01) {
      MountPointComponent.unmountEntity(entity)
      continue
    }
    const mountTransform = getComponent(getComponent(entity, SittingComponent).mountPointEntity, TransformComponent)

    mountTransform.matrixWorld.decompose(vec3_0, quat, vec3_1)
    const rig = getComponent(entity, AvatarRigComponent).bonesToEntities
    vec3_0.y -= getComponent(rig.hips, NormalizedBoneComponent).position.y - 0.25
    setComponent(entity, TransformComponent, { rotation: mountTransform.rotation, position: vec3_0 })

    if (!hasComponent(entity, MotionCaptureRigComponent)) continue

    //Force mocapped avatar to always face the mount point's rotation
    //const hipsQaut = new Quaternion(
    //  MotionCaptureRigComponent.rig.hips.x[entity],
    //  MotionCaptureRigComponent.rig.hips.y[entity],
    //  MotionCaptureRigComponent.rig.hips.z[entity],
    //  MotionCaptureRigComponent.rig.hips.w[entity]
    //)
    //avatarTransform.rotation.copy(mountTransform.rotation).multiply(hipsQaut.invert())
  }
}

const vec3_0 = new Vector3()
const quat = new Quaternion()
const vec3_1 = new Vector3()

export const MountPointSystem = defineSystem({
  uuid: 'ee.engine.MountPointSystem',
  insert: { with: AnimationSystemGroup },
  execute
})
