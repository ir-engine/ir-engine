import { round } from 'lodash'
import React from 'react'

import { useDebugState } from '@xrengine/engine/src/debug/state/DebugState'
import { denormalizeMouseCoordinates } from '@xrengine/engine/src/input/schema/ClientInputSchema'

import { AdjustSharp } from '@mui/icons-material'

export const LastClick: React.FunctionComponent = () => {
  const debugState = useDebugState()
  const show = debugState.show.value
  const [x, y] = debugState.lastClick.value
  const { x: xDn, y: yDn } = denormalizeMouseCoordinates(x, y, window.innerWidth, window.innerHeight)

  return show ? (
    <>
      <AdjustSharp
        style={{
          position: 'absolute',
          left: xDn,
          top: yDn,
          width: '2em',
          height: '2em',
          transform: 'translate(-1em, -1em)',
          color: 'white',
          filter: 'drop-shadow(2px 2px 2px rgb(0 0 0 / 0.4))'
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: xDn,
          top: yDn,
          height: '2em',
          transform: 'translate(2em, -1em)',
          color: '#111',
          backgroundColor: 'lightcoral',
          fontSize: '2em',
          padding: '0.5em'
        }}
      >
        {[round(x, 3), round(y, 3)].join(', ')}
      </div>
    </>
  ) : null
}
