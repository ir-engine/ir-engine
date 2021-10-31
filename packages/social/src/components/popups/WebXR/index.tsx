import React, { useEffect } from 'react'

import { usePopupsStateState } from '@xrengine/client-core/src/social/services/PopupsStateService'

import WebXRPlugin from '../../WebXRPlugin'

interface Props {
  setContentHidden?: any
  feedHintsOnborded?: any
  setFeedHintsOnborded?: any
  webxrRecorderActivity?: any
}
export const WebXRStart = ({
  webxrRecorderActivity,
  feedHintsOnborded,
  setFeedHintsOnborded,
  setContentHidden
}: Props) => {
  const popupsState = usePopupsStateState()
  //common for web xr

  const renderWebXRModal = () =>
    popupsState?.popups?.webxr?.value === true && (
      <div>
        <WebXRPlugin
          feedHintsOnborded={feedHintsOnborded}
          setFeedHintsOnborded={setFeedHintsOnborded}
          setContentHidden={setContentHidden}
          webxrRecorderActivity={webxrRecorderActivity}
        />
      </div>
    )

  useEffect(() => {
    renderWebXRModal()
  }, [popupsState?.popups?.webxr.value])
  return renderWebXRModal()
}

export default WebXRStart
