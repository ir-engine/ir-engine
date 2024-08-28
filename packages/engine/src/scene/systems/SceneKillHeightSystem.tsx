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

import { Not } from 'bitecs'
import { Vector3 } from 'three'

import { defineQuery, defineSystem, getComponent, setComponent, UUIDComponent } from '@ir-engine/ecs'
import { getState } from '@ir-engine/hyperflux'
import { NetworkObjectAuthorityTag } from '@ir-engine/network'
import { SpawnPoseState, TransformComponent } from '@ir-engine/spatial'
import {
  RigidBodyComponent,
  RigidBodyFixedTagComponent
} from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'

import { SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { getAncestorWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformDirtyUpdateSystem } from '@ir-engine/spatial/src/transform/systems/TransformSystem'
import { updateReferenceSpaceFromAvatarMovement } from '../../avatar/functions/moveAvatar'
import { SceneSettingsComponent } from '../components/SceneSettingsComponent'

const heightKillApplicableQuery = defineQuery([
  RigidBodyComponent,
  NetworkObjectAuthorityTag,
  Not(RigidBodyFixedTagComponent)
])

const settingsQuery = defineQuery([SceneSettingsComponent])
const tempVector = new Vector3()

const execute = () => {
  const settingsEntities = settingsQuery()
  const sceneKillHeights = settingsEntities.map((entity) => {
    return [
      getAncestorWithComponents(entity, [SceneComponent]),
      getComponent(entity, SceneSettingsComponent).sceneKillHeight
    ]
  })
  const killableEntities = heightKillApplicableQuery()
  const isCameraAttachedToAvatar = XRState.isCameraAttachedToAvatar

  for (const entity of killableEntities) {
    const sceneEntity = getAncestorWithComponents(entity, [SceneComponent])
    const sceneHeight = sceneKillHeights.find(([scene]) => scene === sceneEntity)?.[1]
    if (typeof sceneHeight !== 'number') continue

    const rigidBodyPosition = getComponent(entity, RigidBodyComponent).position
    if (rigidBodyPosition.y < sceneHeight) {
      const uuid = getComponent(entity, UUIDComponent)
      const spawnState = getState(SpawnPoseState)[uuid]

      // reset entity to it's spawn position
      setComponent(entity, TransformComponent, {
        position: spawnState?.spawnPosition,
        rotation: spawnState?.spawnRotation
      })
      TransformComponent.dirtyTransforms[entity] = true

      if (!isCameraAttachedToAvatar) continue

      //@TODO see if we can implicitly update the reference space when the avatar teleports
      updateReferenceSpaceFromAvatarMovement(
        entity,
        tempVector.subVectors(spawnState?.spawnPosition, rigidBodyPosition)
      )
    }
  }
}

export const SceneKillHeightSystem = defineSystem({
  uuid: 'ee.engine.SceneKillHeightSystem',
  insert: { before: TransformDirtyUpdateSystem },
  execute
})
