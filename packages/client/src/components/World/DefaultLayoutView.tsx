import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { isTouchAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import React, { Suspense } from 'react'
import Debug from '../Debug'
import GameServerWarnings from './GameServerWarnings'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { InteractableModal } from '@xrengine/client-core/src/world/components/InteractableModal'
import InstanceChat from '../InstanceChat'
import MediaIconsBox from '../MediaIconsBox'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import { usePartyState } from '@xrengine/client-core/src/social/services/PartyService'
import { useEngineState } from '@xrengine/client-core/src/world/services/EngineService'

const TouchGamepad = React.lazy(() => import('@xrengine/client-core/src/common/components/TouchGamepad'))

interface Props {
  allowDebug
  locationName
  hideVideo?: boolean
  hideFullscreen?: boolean
}

const DefaultLayoutView = (props: Props) => {
  const authState = useAuthState()
  const selfUser = authState.user
  const party = usePartyState().party.value
  const engineState = useEngineState()

  return (
    <>
      <LoadingScreen />
      {props.allowDebug && <Debug />}
      {isTouchAvailable ? (
        <Suspense fallback={<></>}>
          <TouchGamepad layout="default" />
        </Suspense>
      ) : null}

      <GameServerWarnings
        isTeleporting={!!engineState.isTeleporting.value}
        locationName={props.locationName}
        instanceId={selfUser?.instanceId.value ?? party?.instanceId}
      />
      <InteractableModal />
      {/* <RecordingApp /> */}
      <MediaIconsBox />
      {/*<PersonMenu user={selfUser}/>*/}
      <UserMenu />
      <InstanceChat />
    </>
  )
}

export default DefaultLayoutView
