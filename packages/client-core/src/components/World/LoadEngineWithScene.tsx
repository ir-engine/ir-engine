import React, { useState } from 'react'
import { useHistory } from 'react-router'

import {
  LocationInstanceConnectionAction,
  useLocationInstanceConnectionState
} from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import { LocationService } from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { leaveNetwork } from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { SceneAction, useSceneState } from '@xrengine/client-core/src/world/services/SceneService'
import multiLogger from '@xrengine/common/src/logger'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { WorldNetworkActionReceptor } from '@xrengine/engine/src/networking/functions/WorldNetworkActionReceptor'
import { teleportToScene } from '@xrengine/engine/src/scene/functions/teleportToScene'
import { dispatchAction, useHookEffect } from '@xrengine/hyperflux'

import { AppAction, GeneralStateList } from '../../common/services/AppService'
import {
  accessMediaInstanceConnectionState,
  MediaInstanceConnectionAction
} from '../../common/services/MediaInstanceConnectionService'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'
import { initClient, loadScene } from './LocationLoadHelper'

const logger = multiLogger.child({ component: 'client-core:world' })

export const LoadEngineWithScene = () => {
  const history = useHistory()
  const dispatch = useDispatch()
  const engineState = useEngineState()
  const sceneState = useSceneState()
  const [clientReady, setClientReady] = useState(false)
  const instanceConnectionState = useLocationInstanceConnectionState()

  /**
   * initialise the client
   */
  useHookEffect(() => {
    initClient().then(() => {
      setClientReady(true)
    })
  }, [])

  /**
   * load the scene whenever it changes
   */
  useHookEffect(() => {
    const sceneData = sceneState.currentScene.value
    if (clientReady && sceneData) {
      loadScene(sceneData)
    }
  }, [clientReady, sceneState.currentScene])

  useHookEffect(() => {
    if (engineState.joinedWorld.value) {
      if (engineState.isTeleporting.value) {
        // if we are coming from another scene, reset our teleporting status
        dispatchAction(EngineActions.setTeleporting({ isTeleporting: false }))
      } else {
        dispatch(AppAction.setAppOnBoardingStep(GeneralStateList.SUCCESS))
        dispatch(AppAction.setAppLoaded(true))
      }
    }
  }, [engineState.joinedWorld])

  useHookEffect(async () => {
    if (engineState.isTeleporting.value) {
      // TODO: this needs to be implemented on the server too
      // Use teleportAvatar function from moveAvatar.ts when required
      // if (slugifiedNameOfCurrentLocation === portalComponent.location) {
      //   teleportAvatar(
      //     useWorld().localClientEntity,
      //     portalComponent.remoteSpawnPosition,
      //     portalComponent.remoteSpawnRotation
      //   )
      //   return
      // }

      logger.info('Resetting connection for portal teleport.')

      const world = Engine.instance.currentWorld

      dispatch(SceneAction.currentSceneChanged(null))
      history.push('/location/' + world.activePortal.location)
      LocationService.getLocationByName(world.activePortal.location)

      // shut down connection with existing IS
      await leaveNetwork(world.worldNetwork as SocketWebRTCClientNetwork)

      if (world.mediaNetwork) {
        const isInstanceMediaConnection =
          accessMediaInstanceConnectionState().instances[world.mediaNetwork.hostId].channelType.value === 'instance'
        if (isInstanceMediaConnection) {
          await leaveNetwork(world.mediaNetwork as SocketWebRTCClientNetwork)
        }
      }

      // remove all network clients but own (will be updated when new connection is established)
      WorldNetworkActionReceptor.removeAllNetworkClients(false, world)

      teleportToScene()
    }
  }, [engineState.isTeleporting])

  return <></>
}
