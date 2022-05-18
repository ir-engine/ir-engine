import React, { useEffect, useState } from 'react'

import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'

import PartyParticipantWindow from '../PartyParticipantWindow'

const Me = () => {
  const [expanded, setExpanded] = useState(true)
  // Listening on MediaStreamSystem doesn't appear to register for some reason, but listening
  // to an observable property of it does.
  useEffect((() => {
    function handleResize() {
      if (window.innerWidth < 768) setExpanded(true)
    }

    window.addEventListener('resize', handleResize)

    return (_) => {
      window.removeEventListener('resize', handleResize)
    }
  }) as any)

  return (
    <>
      <PartyParticipantWindow
        containerProportions={{
          height: 135,
          width: 240
        }}
        peerId={'me_cam'}
      />
      {(MediaStreams.instance?.screenVideoProducer || MediaStreams.instance?.screenAudioProducer) && (
        <PartyParticipantWindow
          containerProportions={{
            height: 135,
            width: 240
          }}
          peerId={'me_screen'}
        />
      )}
    </>
  )
}

export default Me
