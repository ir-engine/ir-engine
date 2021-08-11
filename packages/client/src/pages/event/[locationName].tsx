import React, { useState } from 'react'
import Scene, { EngineCallbacks } from '../../components/Scene/location'
import Layout from '../../components/Layout/Layout'
import { useTranslation } from 'react-i18next'
import Store from '@xrengine/client-core/src/store'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { CharacterUISystem } from '@xrengine/client-core/src/systems/CharacterUISystem'
import { UISystem } from '@xrengine/engine/src/xrui/systems/UISystem'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { awaitEngaged } from '@xrengine/engine/src/ecs/classes/Engine'
import { GeneralStateList, setAppSpecificOnBoardingStep } from '@xrengine/client-core/src/common/reducers/app/actions'

const engineRendererCanvasId = 'engine-renderer-canvas'

const engineInitializeOptions: InitializeOptions = {
  publicPath: location.origin,
  networking: {
    schema: {
      transport: SocketWebRTCClientTransport
    } as NetworkSchema
  },
  renderer: {
    canvasId: engineRendererCanvasId
  },
  physics: {
    simulationEnabled: false,
    physxWorker: new Worker('/scripts/loadPhysXClassic.js')
  },
  systems: [
    {
      system: CharacterUISystem,
      after: UISystem
    }
  ]
}

const LocationPage = (props) => {
  const [loadingItemCount, setLoadingItemCount] = useState(99)
  const { t } = useTranslation()

  const onSceneLoadProgress = (loadingItemCount: number): void => {
    setLoadingItemCount(loadingItemCount || 0)
  }

  const engineCallbacks: EngineCallbacks = {
    onSceneLoadProgress,
    onSceneLoaded: async () => {
      setLoadingItemCount(0)
      try {
        // event logic hook must be in the form of `export async function [locationName] {}`
        const event = await import(/* @vite-ignore */ `../Events/${props.match.params.locationName}.tsx`)
        await event[props.match.params.locationName]()
      } catch (e) {
        console.log('could not run event specific logic', props.match.params.locationName, e)
      }

      Store.store.dispatch(setAppSpecificOnBoardingStep(GeneralStateList.AWAITING_INPUT, false))

      await awaitEngaged()
    },
  }

  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <LoadingScreen objectsToLoad={loadingItemCount} />
      <Scene
        locationName={props.match.params.locationName}
        history={props.history}
        engineInitializeOptions={engineInitializeOptions}
        showEmoteMenu
        showInteractable
        showTouchpad
        engineCallbacks={engineCallbacks}
        userMenuProps={{
          hideLogin: true,
          enableSharing: false
        }}
      />
    </Layout>
  )
}

export default LocationPage
