import { UserID } from '@etherealengine/common/src/schema.type.module'
import { Engine, getComponent, removeComponent, setComponent } from '@etherealengine/ecs'
import { defineAction, defineState, getMutableState, getState, none, useHookstate } from '@etherealengine/hyperflux'
import { NetworkObjectComponent, NetworkTopics, WorldNetworkAction, matchesUserID } from '@etherealengine/network'
import React, { useEffect } from 'react'
import { MathUtils } from 'three'
import { TransformComponent } from '../../SpatialModule'
import {
  ComputedTransformComponent,
  setComputedTransformComponent
} from '../../transform/components/ComputedTransformComponent'
import { CameraComponent } from '../components/CameraComponent'
import { FlyControlComponent } from '../components/FlyControlComponent'

export class SpectateActions {
  static spectateEntity = defineAction({
    type: 'ee.engine.Engine.SPECTATE_USER' as const,
    spectatorUserID: matchesUserID,
    spectatingUserID: matchesUserID.optional(),
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
  initial: {} as Record<UserID, { spectating?: UserID }>,

  receptors: {
    onSpectateUser: SpectateActions.spectateEntity.receive((action) => {
      getMutableState(SpectateEntityState)[action.spectatorUserID].set({
        spectating: action.spectatingUserID as UserID | undefined
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
    const state = useHookstate(getMutableState(SpectateEntityState))

    if (!state.value[Engine.instance.userID]) return null

    return <SpectatorReactor />
  }
})

const SpectatorReactor = () => {
  const state = useHookstate(getMutableState(SpectateEntityState)[Engine.instance.userID])

  useEffect(() => {
    const cameraEntity = Engine.instance.viewerEntity

    console.log(state.spectating.value)
    if (state.spectating.value) {
      const cameraTransform = getComponent(cameraEntity, TransformComponent)
      const networkCameraEntity = NetworkObjectComponent.getOwnedNetworkObjectWithComponent(
        state.spectating.value,
        CameraComponent
      )
      const networkTransform = getComponent(networkCameraEntity, TransformComponent)
      setComputedTransformComponent(cameraEntity, networkCameraEntity, () => {
        cameraTransform.position.copy(networkTransform.position)
        cameraTransform.rotation.copy(networkTransform.rotation)
      })
      return () => {
        removeComponent(cameraEntity, ComputedTransformComponent)
      }
    } else {
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

  return null
}
