/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { PerspectiveCamera } from 'three'

import {
  AnimationSystemGroup,
  defineQuery,
  defineSystem,
  Engine,
  EntityUUID,
  getComponent,
  getOptionalMutableComponent,
  setComponent,
  UUIDComponent
} from '@etherealengine/ecs'
import { defineState, getMutableState, none, useMutableState } from '@etherealengine/hyperflux'
import { NetworkObjectOwnedTag, WorldNetworkAction } from '@etherealengine/network'

import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { CameraSettingsState } from '../CameraSceneMetadata'
import { CameraActions } from '../CameraState'
import { CameraComponent } from '../components/CameraComponent'
import { FollowCameraComponent } from '../components/FollowCameraComponent'

export const CameraEntityState = defineState({
  name: 'CameraEntityState',
  initial: {} as Record<EntityUUID, true>,

  receptors: {
    onCameraSpawn: CameraActions.spawnCamera.receive((action) => {
      getMutableState(CameraEntityState)[action.entityUUID].set(true)
    }),
    onEntityDestroy: WorldNetworkAction.destroyEntity.receive((action) => {
      getMutableState(CameraEntityState)[action.entityUUID].set(none)
    })
  },

  reactor: () => {
    const state = useMutableState(CameraEntityState)
    return (
      <>
        {state.keys.map((entityUUID: EntityUUID) => (
          <CameraEntity key={entityUUID} entityUUID={entityUUID} />
        ))}
      </>
    )
  }
})

const CameraEntity = (props: { entityUUID: EntityUUID }) => {
  const entity = UUIDComponent.useEntityByUUID(props.entityUUID)

  useEffect(() => {
    if (!entity) return
    setComponent(entity, CameraComponent)
  }, [entity])

  return null
}

const ownedNetworkCamera = defineQuery([CameraComponent, NetworkObjectOwnedTag])

function CameraReactor() {
  const cameraSettings = useMutableState(CameraSettingsState)

  useEffect(() => {
    if (!cameraSettings?.cameraNearClip) return
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent) as PerspectiveCamera
    if (camera?.isPerspectiveCamera) {
      camera.fov = cameraSettings.fov.value
      camera.near = cameraSettings.cameraNearClip.value
      camera.far = cameraSettings.cameraFarClip.value
      camera.updateProjectionMatrix()
    }
  }, [cameraSettings.fov, cameraSettings.cameraNearClip, cameraSettings.cameraFarClip])

  // TODO: this is messy and not properly reactive; we need a better way to handle camera settings
  useEffect(() => {
    if (!cameraSettings?.fov) return
    const follow = getOptionalMutableComponent(Engine.instance.cameraEntity, FollowCameraComponent)
    if (follow) {
      follow.minDistance.set(cameraSettings.minCameraDistance.value)
      follow.maxDistance.set(cameraSettings.maxCameraDistance.value)
      follow.distance.set(cameraSettings.startCameraDistance.value)
    }
  }, [cameraSettings])

  return null
}

const execute = () => {
  // as spectatee: update network camera from local camera
  /** @todo event source this */
  for (const networkCameraEntity of ownedNetworkCamera.enter()) {
    const networkTransform = getComponent(networkCameraEntity, TransformComponent)
    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    setComponent(networkCameraEntity, ComputedTransformComponent, {
      referenceEntities: [Engine.instance.viewerEntity],
      computeFunction: () => {
        networkTransform.position.copy(cameraTransform.position)
        networkTransform.rotation.copy(cameraTransform.rotation)
      }
    })
  }
}

const reactor = () => {
  return <CameraReactor />
}

export const CameraSystem = defineSystem({
  uuid: 'ee.engine.CameraSystem',
  insert: { with: AnimationSystemGroup },
  execute,
  reactor
})
