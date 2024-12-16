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

import React, { useEffect } from 'react'
import { MathUtils } from 'three'

import {
  Engine,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  matchesEntityUUID,
  removeComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import {
  defineAction,
  defineState,
  getMutableState,
  getState,
  none,
  useHookstate,
  useMutableState,
  UserID
} from '@ir-engine/hyperflux'
import { matchesUserID, NetworkTopics, WorldNetworkAction } from '@ir-engine/network'

import { EngineState } from '../../EngineState'
import { ComputedTransformComponent } from '../../transform/components/ComputedTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { FlyControlComponent } from '../components/FlyControlComponent'

export class SpectateActions {
  static spectateEntity = defineAction({
    type: 'ee.engine.Engine.SPECTATE_USER' as const,
    spectatorUserID: matchesUserID,
    spectatingEntity: matchesEntityUUID.optional(),
    $topic: NetworkTopics.world
  })

  static exitSpectate = defineAction({
    type: 'ee.engine.Engine.EXIT_SPECTATE' as const,
    spectatorUserID: matchesUserID,
    $topic: NetworkTopics.world
  })
}

export const SpectateEntityState = defineState({
  name: 'SpectateEntityState',
  initial: {} as Record<UserID, { spectating?: EntityUUID }>,

  receptors: {
    onSpectateUser: SpectateActions.spectateEntity.receive((action) => {
      getMutableState(SpectateEntityState)[action.spectatorUserID].set({
        spectating: action.spectatingEntity as EntityUUID | undefined
      })
    }),
    onEntityDestroy: WorldNetworkAction.destroyEntity.receive((action) => {
      if (getState(SpectateEntityState)[action.entityUUID]) {
        getMutableState(SpectateEntityState)[action.entityUUID].set(none)
      }
      for (const spectatorUserID in getState(SpectateEntityState)) {
        if (getState(SpectateEntityState)[spectatorUserID].spectating === action.entityUUID) {
          getMutableState(SpectateEntityState)[spectatorUserID].set(none)
        }
      }
    }),
    onExitSpectate: SpectateActions.exitSpectate.receive((action) => {
      getMutableState(SpectateEntityState)[action.spectatorUserID].set(none)
    })
  },

  reactor: () => {
    const state = useMutableState(SpectateEntityState)

    if (!state.value[Engine.instance.userID]) return null

    return <SpectatorReactor />
  }
})

const SpectatorReactor = () => {
  const state = useHookstate(getMutableState(SpectateEntityState)[Engine.instance.userID])

  useEffect(() => {
    const cameraEntity = getState(EngineState).viewerEntity

    if (!state.spectating.value) {
      setComponent(cameraEntity, FlyControlComponent, {
        boostSpeed: 4,
        moveSpeed: 4,
        lookSensitivity: 5,
        maxXRotation: MathUtils.degToRad(80)
      })
      return () => {
        removeComponent(cameraEntity, FlyControlComponent)
      }
    }
  }, [state.spectating])

  if (!state.spectating.value) return null

  return <SpectatingUserReactor key={state.spectating.value} entityUUID={state.spectating.value} />
}

const SpectatingUserReactor = (props: { entityUUID: EntityUUID }) => {
  const spectateEntity = UUIDComponent.useEntityByUUID((props.entityUUID + '_camera') as EntityUUID)

  useEffect(() => {
    if (!spectateEntity) return

    const cameraEntity = getState(EngineState).viewerEntity
    const cameraTransform = getComponent(cameraEntity, TransformComponent)
    setComponent(cameraEntity, ComputedTransformComponent, {
      referenceEntities: [spectateEntity],
      computeFunction: () => {
        const networkTransform = getOptionalComponent(spectateEntity, TransformComponent)
        if (!networkTransform) return
        cameraTransform.position.copy(networkTransform.position)
        cameraTransform.rotation.copy(networkTransform.rotation)
      }
    })
    return () => {
      removeComponent(cameraEntity, ComputedTransformComponent)
    }
  }, [spectateEntity])

  return null
}
