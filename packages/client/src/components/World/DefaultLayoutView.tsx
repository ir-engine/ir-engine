import Button from '@material-ui/core/Button'
import Snackbar from '@material-ui/core/Snackbar'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { isTouchAvailable } from '@xrengine/engine/src/common/functions/DetectFeatures'
import React, { Suspense, useEffect, useState } from 'react'
import NetworkDebug from '../NetworkDebug'
import GameServerWarnings from './GameServerWarnings'
import EmoteMenu from '@xrengine/client-core/src/common/components/EmoteMenu'
import UserMenu from '@xrengine/client-core/src/user/components/UserMenu'
import { InteractableModal } from '@xrengine/client-core/src/world/components/InteractableModal'
import InstanceChat from '../InstanceChat'
import MediaIconsBox from '../MediaIconsBox'
import LoadingScreen from '@xrengine/client-core/src/common/components/Loader'
import { usePartyState } from '@xrengine/client-core/src/social/state/PartyState'

const goHome = () => (window.location.href = window.location.origin)

const TouchGamepad = React.lazy(() => import('@xrengine/client-core/src/common/components/TouchGamepad'))

interface Props {
  loadingItemCount
  isValidLocation
  allowDebug
  reinit
  children
  showTouchpad
  isTeleporting
  locationName

  // todo: remove these props in favour of projects
  customComponents?: any
  theme?: any
  hideVideo?: boolean
  hideFullscreen?: boolean
}

const DefaultLayoutView = (props: Props) => {
  const authState = useAuthState()
  const selfUser = authState.user
  const party = usePartyState().party.value

  return (
    <>
      <LoadingScreen objectsToLoad={props.loadingItemCount} />
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

      {props.children}
      {props.customComponents}

      {props.showTouchpad && isTouchAvailable ? (
        <Suspense fallback={<></>}>
          <TouchGamepad layout="default" />
        </Suspense>
      ) : null}

      <GameServerWarnings
        isTeleporting={props.isTeleporting}
        locationName={props.locationName}
        instanceId={selfUser?.instanceId.value ?? party?.instanceId}
      />
      <InteractableModal />
      {/* <RecordingApp /> */}
      <MediaIconsBox />
      <UserMenu />
      <EmoteMenu />
      <InstanceChat />
    </>
  )
}

const connector = DefaultLayoutView

export default connector
