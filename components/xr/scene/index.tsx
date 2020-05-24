import SceneContainer from './scene-container'
import { Environment } from './environment'
import Player from '../player/player'
import './style.scss'
import SvgVr from '../../icons/svg/Vr'

import AframeComponentRegisterer from '../aframe/index'

interface Props {
  children?: any
}

export const SceneRoot = (props: Props) => {
  const { children } = props
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <SceneContainer>
        <AframeComponentRegisterer />
        <Player />
        <Environment />
        {children}
        <a className="enterVR" id="enterVRButton" href="#">
          <SvgVr className="enterVR" />
        </a>
      </SceneContainer>
    </div>
  )
}

export default SceneRoot
