import React, { useEffect, useState } from 'react'
import styles from './Me.module.scss'
import PartyParticipantWindow from '../PartyParticipantWindow'
import { ChevronRight } from '@material-ui/icons'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'

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

  const toggleExpanded = () => setExpanded(!expanded)

  return (
    <>
      <div className={styles.expandMenu}>
        You
        <button type="button" className={expanded ? styles.expanded : ''} onClick={toggleExpanded}>
          <ChevronRight />
        </button>
      </div>
      {expanded ? (
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
      ) : null}
    </>
  )
}

export default Me
