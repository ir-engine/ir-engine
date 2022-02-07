import React, { useEffect, useRef, useState } from 'react'
import { useHistory } from 'react-router'
import { initClient, initEngine, loadLocation } from './LocationLoadHelper'
import { EngineActions, useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { SceneAction, SceneService, useSceneState } from '@xrengine/client-core/src/world/services/SceneService'
import {
  LocationInstanceConnectionAction,
  LocationInstanceConnectionService
} from '@xrengine/client-core/src/common/services/LocationInstanceConnectionService'
import {
  LocationAction,
  LocationService,
  useLocationState
} from '@xrengine/client-core/src/social/services/LocationService'
import { useDispatch } from '@xrengine/client-core/src/store'
import { leave } from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { getWorldTransport } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import { useProjectState } from '@xrengine/client-core/src/common/services/ProjectService'
import { teleportToScene } from '@xrengine/engine/src/scene/functions/teleportToScene'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'

const engineRendererCanvasId = 'engine-renderer-canvas'

const canvasStyle = {
  zIndex: 0,
  width: '100%',
  height: '100%',
  position: 'fixed',
  WebkitUserSelect: 'none',
  pointerEvents: 'auto',
  userSelect: 'none'
} as React.CSSProperties

const canvas = <canvas id={engineRendererCanvasId} style={canvasStyle} />

interface Props {
  setLoadingItemCount?: any
}

export const LoadEngineWithScene = (props: Props) => {
  const locationState = useLocationState()
  const history = useHistory()
  const dispatch = useDispatch()
  const engineState = useEngineState()
  const sceneState = useSceneState()
  const projectState = useProjectState()
  const [clientInitialized, setClientInitialized] = useState(false)
  const [clientReady, setClientReady] = useState(false)

  useEffect(() => {
    initEngine()
  }, [])

  /**
   * Once we know what projects we need, initialise the client.
   */
  useEffect(() => {
    // We assume that the number of projects will always be greater than 0 as the default project is assumed un-deletable
    if (
      !clientInitialized &&
      engineState.isEngineInitialized.value &&
      locationState.currentLocation.location.sceneId.value &&
      projectState.projects.value.length > 0
    ) {
      setClientInitialized(true)
      const [project] = locationState.currentLocation.location.sceneId.value.split('/')
      initClient(project).then(() => {
        setClientReady(true)
      })
    }
  }, [
    engineState.isEngineInitialized,
    projectState.projects.value,
    locationState.currentLocation.location.sceneId.value
  ])

  /**
   * Once we have the scene, get the scene data
   */
  useEffect(() => {
    if (locationState.currentLocation.location.sceneId.value) {
      const [project, scene] = locationState.currentLocation.location.sceneId.value.split('/')
      SceneService.getSceneData(project, scene)
    }
  }, [locationState.currentLocation.location.sceneId.value])

  /**
   * Once we have the scene data, load the location
   */
  useEffect(() => {
    if (clientReady && locationState.currentLocation.location.sceneId.value && sceneState.currentScene?.name?.value) {
      loadLocation()
    }
  }, [clientReady, locationState.currentLocation?.location?.sceneId?.value, sceneState.currentScene?.name])

  useEffect(() => {
    if (engineState.joinedWorld.value && engineState.isTeleporting.value) {
      // if we are coming from another scene, reset our teleporting status
      dispatchLocal(EngineActions.setTeleporting(false))
    }
  }, [engineState.joinedWorld.value])

  useEffect(() => {
    if (engineState.isTeleporting.value) {
      // TODO: this needs to be implemented on the server too
      // if (slugifiedNameOfCurrentLocation === portalComponent.location) {
      //   teleportPlayer(
      //     useWorld().localClientEntity,
      //     portalComponent.remoteSpawnPosition,
      //     portalComponent.remoteSpawnRotation
      //   )
      //   return
      // }

      console.log('reseting connection for portal teleport')

      const world = useWorld()

      dispatch(SceneAction.sceneLoaded(null!))
      history.push('/location/' + world.activePortal.location)
      LocationService.getLocationByName(world.activePortal.location)

      // shut down connection with existing GS
      leave(getWorldTransport())
      dispatch(LocationInstanceConnectionAction.disconnect())

      teleportToScene()
    }
  }, [engineState.isTeleporting.value])

  return canvas
}
