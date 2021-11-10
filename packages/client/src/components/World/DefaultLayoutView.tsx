import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { isTouchAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import React, { Suspense, useEffect, useState } from 'react'
import NetworkDebug from '../NetworkDebug'
import GameServerWarnings from './GameServerWarnings'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { InteractableModal } from '@xrengine/client-core/src/world/components/InteractableModal'
import InstanceChat from '../InstanceChat'
import MediaIconsBox from '../MediaIconsBox'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import { usePartyState } from '@xrengine/client-core/src/social/services/PartyService'
import { useEngineState } from '@xrengine/client-core/src/world/services/EngineService'

const goHome = () => (window.location.href = window.location.origin)

const TouchGamepad = React.lazy(() => import('@xrengine/client-core/src/common/components/TouchGamepad'))

interface Props {
  isValidLocation
  allowDebug
  reinit
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
      {!props.isValidLocation && (
        <Snackbar
          open
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center'
          }}
        >
          <>
            <section>Location is invalid</section>
            <Button onClick={goHome}>Return Home</Button>
          </>
        </Snackbar>
      )}
      {props.allowDebug && <NetworkDebug reinit={props.reinit} />}
      {isTouchAvailable ? (
        <Suspense fallback={<></>}>
          <TouchGamepad layout="default" />
        </Suspense>
      ) : null}

      <GameServerWarnings
        isTeleporting={engineState.isTeleporting.value}
        locationName={props.locationName}
        instanceId={selfUser?.instanceId.value ?? party?.instanceId}
      />
      <InteractableModal />
      {/* <RecordingApp /> */}
      <MediaIconsBox />
      <UserMenu />
      <InstanceChat />
    </>
  )
}

export default DefaultLayoutView
