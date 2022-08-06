import { useHookstate } from '@hookstate/core'
import React, { useState } from 'react'
import { useHistory } from 'react-router'
import { useParams } from 'react-router-dom'

import { LocationInstanceConnectionServiceReceptor } from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import { leaveNetwork } from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { AuthService, useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import {
  SceneActions,
  SceneServiceReceptor,
  useSceneState
} from '@xrengine/client-core/src/world/services/SceneService'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { getSearchParamFromURL } from '@xrengine/common/src/utils/getSearchParamFromURL'
import { SpawnPoints } from '@xrengine/engine/src/avatar/AvatarSpawnSystem'
import { teleportAvatar } from '@xrengine/engine/src/avatar/functions/moveAvatar'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { spawnLocalAvatarInWorld } from '@xrengine/engine/src/networking/functions/receiveJoinWorld'
import {
  PortalEffects,
  revertAvatarToMovingStateFromTeleport,
  setAvatarToLocationTeleportingState
} from '@xrengine/engine/src/scene/functions/loaders/PortalFunctions'
import { addActionReceptor, dispatchAction, removeActionReceptor, useHookEffect } from '@xrengine/hyperflux'

import { AppLoadingAction, AppLoadingStates, useLoadingState } from '../../common/services/AppLoadingService'
import { useLocationState } from '../../social/services/LocationService'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'
import { initClient, loadScene } from './LocationLoadHelper'

const logger = multiLogger.child({ component: 'client-core:world' })

export const LoadEngineWithScene = () => {
  const history = useHistory()
  const engineState = useEngineState()
  const sceneState = useSceneState()
  const loadingState = useLoadingState()
  const locationState = useLocationState()
  const authState = useAuthState()
  const [clientReady, setClientReady] = useState(false)

  /**
   * initialise the client
   */
  useHookEffect(() => {
    initClient().then(() => {
      setClientReady(true)
    })

    addActionReceptor(SceneServiceReceptor)
    addActionReceptor(LocationInstanceConnectionServiceReceptor)

    return () => {
      removeActionReceptor(SceneServiceReceptor)
      removeActionReceptor(LocationInstanceConnectionServiceReceptor)
    }
  }, [])

  /**
   * load the scene whenever it changes
   */
  useHookEffect(() => {
    const sceneData = sceneState.currentScene.value
    if (clientReady && sceneData) {
      AuthService.fetchAvatarList()
      if (loadingState.state.value !== AppLoadingStates.SUCCESS)
        dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.SCENE_LOADING }))
      loadScene(sceneData).then(() => {
        if (loadingState.state.value !== AppLoadingStates.SUCCESS)
          dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.SCENE_LOADED }))
      })
    }
  }, [clientReady, sceneState.currentScene])

  const didSpawn = useHookstate(false)

  const spectateParam = useParams<{ spectate: UserId }>().spectate

  const numSpawnPoints = useHookstate(SpawnPoints.instance.spawnPoints).length

  useHookEffect(async () => {
    if (
      didSpawn.value === true ||
      Engine.instance.currentWorld.localClientEntity ||
      !engineState.sceneLoaded.value ||
      !authState.user.value ||
      !authState.avatarList.value.length ||
      spectateParam ||
      numSpawnPoints === 0
    )
      return

    // the avatar should only be spawned once, after user auth and scene load

    const user = authState.user.value
    const avatarDetails = authState.avatarList.value.find((avatar) => avatar?.id === user.avatarId)!
    const spawnPoint = getSearchParamFromURL('spawnPoint')

    const avatarSpawnPose = spawnPoint
      ? SpawnPoints.instance.getSpawnPoint(spawnPoint)
      : SpawnPoints.instance.getRandomSpawnPoint()

    spawnLocalAvatarInWorld({
      avatarSpawnPose,
      avatarDetail: {
        avatarURL: avatarDetails.modelResource?.url!,
        thumbnailURL: avatarDetails.thumbnailResource?.url!
      },
      name: user.name
    })
  }, [engineState.sceneLoaded, authState.user, authState.avatarList, spectateParam, numSpawnPoints])

  useHookEffect(() => {
    if (engineState.sceneLoaded.value) {
      if (loadingState.state.value !== AppLoadingStates.SUCCESS)
        dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.SUCCESS }))
      if (engineState.isTeleporting.value) {
        revertAvatarToMovingStateFromTeleport(Engine.instance.currentWorld)
      }
    }
  }, [engineState.sceneLoaded])

  useHookEffect(() => {
    if (engineState.isTeleporting.value) {
      logger.info('Resetting connection for portal teleport.')
      const world = Engine.instance.currentWorld
      const activePortal = world.activePortal

      if (!activePortal) return

      const currentLocation = locationState.locationName.value.split('/')[1]
      if (currentLocation === activePortal.location || world.entityTree.uuidNodeMap.get(activePortal.linkedPortalId)) {
        teleportAvatar(
          world.localClientEntity,
          activePortal.remoteSpawnPosition
          // activePortal.remoteSpawnRotation
        )
        world.activePortal = null
        dispatchAction(EngineActions.setTeleporting({ isTeleporting: false, $time: Date.now() + 500 }))
        return
      }

      if (activePortal.redirect) {
        window.location.href = Engine.instance.publicPath + '/location/' + activePortal.location
        return
      }

      dispatchAction(SceneActions.unloadCurrentScene({}))
      history.push('/location/' + world.activePortal!.location)
      LocationService.getLocationByName(world.activePortal!.location, authState.user.id.value)

      // shut down connection with existing world instance server
      // leaving a world instance server will check if we are in a location media instance and shut that down too
      leaveNetwork(world.worldNetwork as SocketWebRTCClientNetwork)

      setAvatarToLocationTeleportingState(world)

      if (activePortal.effectType !== 'None') {
        addComponent(world.sceneEntity, PortalEffects.get(activePortal.effectType), true)
      } else {
        dispatchAction(AppLoadingAction.setLoadingState({ state: AppLoadingStates.START_STATE }))
      }
    }
  }, [engineState.isTeleporting])

  return <></>
}
