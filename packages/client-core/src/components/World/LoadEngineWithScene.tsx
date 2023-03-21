import { useHookstate } from '@hookstate/core'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { LocationInstanceConnectionServiceReceptor } from '@etherealengine/client-core/src/common/services/LocationInstanceConnectionService'
import { LocationService } from '@etherealengine/client-core/src/social/services/LocationService'
import { leaveNetwork } from '@etherealengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { useAuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { SceneServiceReceptor, useSceneState } from '@etherealengine/client-core/src/world/services/SceneService'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { getSearchParamFromURL } from '@etherealengine/common/src/utils/getSearchParamFromURL'
import { getRandomSpawnPoint, getSpawnPoint } from '@etherealengine/engine/src/avatar/AvatarSpawnSystem'
import { teleportAvatar } from '@etherealengine/engine/src/avatar/functions/moveAvatar'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { addComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { SystemModuleType } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { spawnLocalAvatarInWorld } from '@etherealengine/engine/src/networking/functions/receiveJoinWorld'
import { PortalEffects } from '@etherealengine/engine/src/scene/components/PortalComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { setAvatarToLocationTeleportingState } from '@etherealengine/engine/src/scene/functions/loaders/PortalFunctions'
import { XRState } from '@etherealengine/engine/src/xr/XRState'
import { addActionReceptor, dispatchAction, getMutableState, removeActionReceptor } from '@etherealengine/hyperflux'

import { AppLoadingAction, AppLoadingStates, useLoadingState } from '../../common/services/AppLoadingService'
import { NotificationService } from '../../common/services/NotificationService'
import { useRouter } from '../../common/services/RouterService'
import { useLocationState } from '../../social/services/LocationService'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { initClient, loadScene } from './LocationLoadHelper'

const logger = multiLogger.child({ component: 'client-core:world' })

type LoadEngineProps = {
  injectedSystems?: SystemModuleType<any>[]
}

export const useLoadEngine = ({ injectedSystems }: LoadEngineProps) => {
  useEffect(() => {
    initClient(injectedSystems)

    addActionReceptor(SceneServiceReceptor)
    addActionReceptor(LocationInstanceConnectionServiceReceptor)

    return () => {
      removeActionReceptor(SceneServiceReceptor)
      removeActionReceptor(LocationInstanceConnectionServiceReceptor)
    }
  }, [])
}

export const useLocationSpawnAvatar = (spectate = false) => {
  const engineState = useEngineState()
  const authState = useAuthState()

  const spectateParam = useParams<{ spectate: UserId }>().spectate

  useEffect(() => {
    if (spectate) {
      if (!engineState.sceneLoaded.value || !authState.user.value || !authState.user.avatar.value) return
      dispatchAction(EngineActions.spectateUser({}))
      dispatchAction(EngineActions.joinedWorld({}))
      return
    }

    if (
      Engine.instance.localClientEntity ||
      !engineState.sceneLoaded.value ||
      !authState.user.value ||
      !authState.user.avatar.value ||
      spectateParam
    )
      return

    // the avatar should only be spawned once, after user auth and scene load
    const user = authState.user
    const avatarDetails = user.avatar.value
    const spawnPoint = getSearchParamFromURL('spawnPoint')

    const avatarSpawnPose = spawnPoint
      ? getSpawnPoint(spawnPoint, Engine.instance.userId)
      : getRandomSpawnPoint(Engine.instance.userId)

    if (avatarDetails.modelResource?.LOD0_url || (avatarDetails.modelResource as any).src)
      spawnLocalAvatarInWorld({
        avatarSpawnPose,
        avatarDetail: {
          avatarURL: avatarDetails.modelResource?.LOD0_url || (avatarDetails.modelResource as any)?.src,
          thumbnailURL: avatarDetails.thumbnailResource?.LOD0_url || (avatarDetails.thumbnailResource as any)?.src
        },
        name: user.name.value
      })
    else {
      NotificationService.dispatchNotify(
        'Your avatar is missing its model. Please change your avatar from the user menu.',
        { variant: 'error' }
      )
    }
  }, [engineState.sceneLoaded, authState.user, authState.user?.avatar, spectateParam])
}

export const usePortalTeleport = () => {
  const route = useRouter()
  const engineState = useEngineState()
  const locationState = useLocationState()
  const authState = useAuthState()

  useEffect(() => {
    if (engineState.isTeleporting.value) {
      logger.info('Resetting connection for portal teleport.')
      const activePortal = Engine.instance.activePortal

      if (!activePortal) return

      const currentLocation = locationState.locationName.value.split('/')[1]
      if (
        currentLocation === activePortal.location ||
        UUIDComponent.entitiesByUUID[activePortal.linkedPortalId]?.value
      ) {
        teleportAvatar(
          Engine.instance.localClientEntity,
          activePortal.remoteSpawnPosition
          // activePortal.remoteSpawnRotation
        )
        Engine.instance.activePortal = null
        dispatchAction(EngineActions.setTeleporting({ isTeleporting: false, $time: Date.now() + 500 }))
        return
      }

      if (activePortal.redirect) {
        window.location.href = engineState.publicPath.value + '/location/' + activePortal.location
        return
      }

      route('/location/' + Engine.instance.activePortal!.location)
      LocationService.getLocationByName(Engine.instance.activePortal!.location, authState.user.id.value)

      // shut down connection with existing world instance server
      // leaving a world instance server will check if we are in a location media instance and shut that down too
      leaveNetwork(Engine.instance.worldNetwork as SocketWebRTCClientNetwork)

      setAvatarToLocationTeleportingState()
      if (activePortal.effectType !== 'None') {
        addComponent(Engine.instance.localClientEntity, PortalEffects.get(activePortal.effectType), true)
      } else {
        dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.START_STATE }))
      }
    }
  }, [engineState.isTeleporting])
}

type Props = {
  injectedSystems?: SystemModuleType<any>[]
  spectate?: boolean
}

export const LoadEngineWithScene = ({ injectedSystems, spectate }: Props) => {
  const engineState = useEngineState()
  const sceneState = useSceneState()
  const loadingState = useLoadingState()

  useLoadEngine({ injectedSystems })
  useLocationSpawnAvatar(spectate)
  usePortalTeleport()

  /**
   * load the scene whenever it changes
   */
  useEffect(() => {
    // loadScene() deserializes the scene data, and deserializers sometimes mutate/update that data for backwards compatability.
    // Since hookstate throws errors when mutating proxied values, we have to pass down the unproxied value here
    const sceneData = sceneState.currentScene.get({ noproxy: true })
    if (engineState.isEngineInitialized.value && sceneData) {
      if (loadingState.state.value !== AppLoadingStates.SUCCESS)
        dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.SCENE_LOADING }))
      loadScene(sceneData)
    }
  }, [engineState.isEngineInitialized, sceneState.currentScene])

  useEffect(() => {
    if (engineState.sceneLoaded.value && loadingState.state.value !== AppLoadingStates.SUCCESS)
      dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.SUCCESS }))
  }, [engineState.sceneLoaded, engineState.loadingProgress])

  return <></>
}
