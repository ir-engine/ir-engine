import { useState, useEffect } from 'react'
import SceneContainer from './scene-container'
import Assets from './assets'
import { Environment } from './environment'
import Player from '../player/player'
import './style.scss'

type State = {
  appRendered?: boolean
  color?: string
}

export const EnvironmentScene = () => {
  const [state, setState] = useState({ appRendered: false })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      require('aframe')
      require('networked-aframe')
      setState({ ...state, appRendered: true })
    }
  }, [])

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {state.appRendered && (
        <SceneContainer>
          <Assets />
          <Environment />
          <Player />
        </SceneContainer>
      )}
    </div>
  )
}

export default EnvironmentScene
