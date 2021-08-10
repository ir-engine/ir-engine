import React from 'react'
import Scene from '../../components/Scene/location'
import Layout from '../../components/Layout/Layout'
import { useTranslation } from 'react-i18next'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { CharacterUISystem } from '@xrengine/client-core/src/systems/CharacterUISystem'
import { UISystem } from '@xrengine/engine/src/xrui/systems/UISystem'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'

const engineRendererCanvasId = 'engine-renderer-canvas'


const LocationPage = (props) => {
  const { t } = useTranslation()

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

  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <Scene
        locationName={props.match.params.locationName}
        history={props.history}
        engineInitializeOptions={engineInitializeOptions}
      />
    </Layout>
  )
}

export default LocationPage
