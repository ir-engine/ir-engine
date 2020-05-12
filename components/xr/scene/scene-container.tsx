import { useState } from 'react'
import { Scene } from 'aframe-react'
import SvgVr from '../../icons/svg/Vr'
import LoadingScreen from '../../ui/Loader'

type Props = {
  children: any
}
export default function SceneContainer({ children }: Props): any {
  const [loaded, setLoaded] = useState(false)
  return (
    <>
      {!loaded && <LoadingScreen />}
      <Scene
        vr-mode-ui="enterVRButton: #enterVRButton"
        class="scene"
        renderer="antialias: true"
        background="color: #FAFAFA"
        loading-screen="enabled: false"
        events={{
          loaded: () => setLoaded(true)
        }}
      >
        {children}
        <a className="enterVR" id="enterVRButton" href="#">
          <SvgVr className="enterVR" />
        </a>
      </Scene>
    </>
  )
}
