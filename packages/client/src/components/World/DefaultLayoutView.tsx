import React, { Suspense } from 'react'

import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import { usePartyState } from '@xrengine/client-core/src/social/services/PartyService'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { isTouchAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'

import Debug from '../Debug'
import InstanceChat from '../InstanceChat'
import MediaIconsBox from '../MediaIconsBox'
import GameServerWarnings from './GameServerWarnings'

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
        locationName={props.locationName}
        instanceId={selfUser?.instanceId.value ?? party?.instanceId!}
      />
      {/* <RecordingApp /> */}
      <MediaIconsBox />
      <UserMenu />
      <InstanceChat />
    </>
  )
}

export default DefaultLayoutView
