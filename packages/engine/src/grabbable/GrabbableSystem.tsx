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

import { defineQuery, defineSystem, getComponent, getOptionalComponent, SimulationSystemGroup } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { NetworkObjectAuthorityTag } from '@ir-engine/network'
import { EngineState } from '@ir-engine/spatial/src/EngineState'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { InputSourceComponent } from '@ir-engine/spatial/src/input/components/InputSourceComponent'
import { ClientInputSystem } from '@ir-engine/spatial/src/input/systems/ClientInputSystem'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { AvatarComponent } from '../avatar/components/AvatarComponent'
import { getHandTarget } from '../avatar/components/AvatarIKComponents'
import { GrabbableComponent, GrabbedComponent, GrabberComponent } from './GrabbableComponent'

import '@ir-engine/spatial/src/transform/SpawnPoseState'
import './GrabbableState'

const ownedGrabbableQuery = defineQuery([GrabbableComponent, GrabbedComponent, NetworkObjectAuthorityTag])

const execute = () => {
  if (getState(EngineState).isEditing) return

  for (const entity of ownedGrabbableQuery()) {
    const grabbedComponent = getComponent(entity, GrabbedComponent)

    const target = getHandTarget(grabbedComponent.grabberEntity, grabbedComponent.attachmentPoint)
    if (!target) continue

    const rigidbodyComponent = getOptionalComponent(entity, RigidBodyComponent)

    if (rigidbodyComponent) {
      rigidbodyComponent.targetKinematicPosition.copy(target.position)
      rigidbodyComponent.targetKinematicRotation.copy(target.rotation)
      // const world = Physics.getWorld(entity)!
      // Physics.setRigidbodyPose(world, entity, target.position, target.rotation, Vector3_Zero, Vector3_Zero)
    } else {
      const grabbableTransform = getComponent(entity, TransformComponent)
      grabbableTransform.position.copy(target.position)
      grabbableTransform.rotation.copy(target.rotation)
    }
  }
}

const executeInput = () => {
  const inputSources = InputSourceComponent.nonCapturedInputSources()
  const buttons = InputComponent.getMergedButtonsForInputSources(inputSources)
  if (buttons.KeyU?.down) {
    const selfAvatarEntity = AvatarComponent.getSelfAvatarEntity()
    if (!selfAvatarEntity) return
    const grabbedComponent = getOptionalComponent(selfAvatarEntity, GrabbedComponent)
    if (!grabbedComponent) return
    const grabberEntity = getComponent(selfAvatarEntity, GrabberComponent)[grabbedComponent.attachmentPoint]
    if (!grabberEntity) return
    GrabbableComponent.drop(grabberEntity, selfAvatarEntity)
  }
}

export const GrabbableSystem = defineSystem({
  uuid: 'ee.engine.GrabbableSystem',
  insert: { with: SimulationSystemGroup },
  execute
})

export const GrabbableInputSystem = defineSystem({
  uuid: 'ee.engine.GrabbableInputSystem',
  insert: { after: ClientInputSystem },
  execute: executeInput
})
