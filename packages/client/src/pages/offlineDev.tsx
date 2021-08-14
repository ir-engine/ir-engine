import {
  GeneralStateList,
  setAppLoaded,
  setAppOnBoardingStep
} from '@xrengine/client-core/src/common/reducers/app/actions'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import Store from '@xrengine/client-core/src/store'
import { testScenes, testUserId, testWorldState } from '@xrengine/common/src/assets/testScenes'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { ClientNetworkStateSystem } from '@xrengine/engine/src/networking/systems/ClientNetworkStateSystem'
import { WorldScene } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { XRSystem } from '@xrengine/engine/src/xr/systems/XRSystem'
import React, { useEffect, useState } from 'react'
import { InitializeOptions } from '../../../engine/src/initializationOptions'
import { Network } from '../../../engine/src/networking/classes/Network'

const canvasStyle = {
  zIndex: 0,
  width: '100%',
  height: '100%',
  position: 'absolute',
  WebkitUserSelect: 'none',
  userSelect: 'none'
} as React.CSSProperties

const LocationPage = () => {
  return (
    <>
      <DevPage />
    </>
  )
}

export default LocationPage

const engineRendererCanvasId = 'engine-renderer-canvas'

const store = Store.store

const DevPage = () => {
  const [isInXR, setIsInXR] = useState(false)
  useEffect(() => {
    init()
  }, [])

  async function init(): Promise<any> {
    const sceneData = testScenes.test

    const initializationOptions: InitializeOptions = {
      renderer: {
        canvasId: engineRendererCanvasId,
        postProcessing: false
      },
      physics: {
        physxWorker: new Worker('/scripts/loadPhysXClassic.js')
      }
    }
    console.log(initializationOptions)
    await initializeEngine(initializationOptions)

    document.dispatchEvent(new CustomEvent('ENGINE_LOADED')) // this is the only time we should use document events. would be good to replace this with react state

    addUIEvents()

    const loadScene = WorldScene.load(sceneData as any)
    store.dispatch(setAppOnBoardingStep(GeneralStateList.SCENE_LOADED))
    setAppLoaded(true)

    const getWorldState = new Promise<void>((resolve) => {
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.CONNECT, id: testUserId })
      Network.instance.incomingMessageQueueReliable.add(testWorldState)
      resolve()
    })

    await Promise.all([loadScene, getWorldState])

    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })
  }

  const addUIEvents = () => {
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.XR_START, async (ev: any) => {
      setIsInXR(true)
    })
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.XR_END, async (ev: any) => {
      setIsInXR(false)
    })
  }

  return (
    <>
      {!isInXR && (
        <div>
          <canvas id={engineRendererCanvasId} style={canvasStyle} />
        </div>
      )}
    </>
  )
}
