import React from 'react'
import World from '../../components/World'
import Layout from '../../components/Layout/Layout'
import { useTranslation } from 'react-i18next'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { CharacterUISystem } from '@xrengine/client-core/src/systems/CharacterUISystem'
import { UISystem } from '@xrengine/engine/src/xrui/systems/UISystem'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { InteractableModal } from '../../../../client-core/src/world/components/InteractableModal'
import RecordingApp from '../../components/Recorder/RecordingApp'
import MediaIconsBox from '../../components/MediaIconsBox'
import UserMenu from '../../../../client-core/src/user/components/UserMenu'
import EmoteMenu from '../../../../client-core/src/common/components/EmoteMenu'

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
      canvasId: 'engine-renderer-canvas'
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
      <World allowDebug={true} locationName={props.match.params.locationName}
        history={props.history}
        engineInitializeOptions={engineInitializeOptions} >
        <InteractableModal />
        <RecordingApp />
        <MediaIconsBox />
        <UserMenu />
        <EmoteMenu />
      </World>
    </Layout>
  )
}

export default LocationPage
