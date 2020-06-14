import { useSelector, useDispatch } from 'react-redux'
import { selectAppState, selectAppLoadPercent } from '../../../redux/app/selector'
import { setAppLoaded, setAppLoadPercent, setAppInVrMode } from '../../../redux/app/actions'
import { Scene } from 'aframe-react'
import SvgVr from '../../icons/svg/Vr.js'
import LoadingScreen from '../../ui/Loader'
import React, { Fragment, useEffect } from 'react'
import LoadingBar from '../../ui/LoadingBar'

interface Props {
  children: any
}
export default function SceneContainer({ children }: Props): any {
  const dispatch = useDispatch()
  const loaded = useSelector(state => selectAppState(state)).get('loaded')
  const setLoaded = loaded => dispatch(setAppLoaded(loaded))
  const loadPercent = useSelector(state => selectAppLoadPercent(state))
  const setInVrMode = inVrMode => dispatch(setAppInVrMode(inVrMode))
  useEffect(() => {
    if (loaded) {
      dispatch(setAppLoadPercent(0))
    }
  }, [loaded])
  return (
    <Fragment>
      {!loaded && (<Fragment>
        <LoadingScreen />
        <LoadingBar loadPercent={loadPercent} />
      </Fragment>)}

      <Scene
        vr-mode-ui="enterVRButton: #enterVRButton"
        class="scene"
        renderer="antialias: true"
        background="color: #FAFAFA"
        loading-screen="enabled: false"
        events={{
          loaded: () => setLoaded(true),
          'enter-vr': () => setInVrMode(true),
          'exit-vr': () => setInVrMode(false)
        }}
      >
        {children}
        <a className="enterVR" id="enterVRButton" href="#">
          <SvgVr className="enterVR" />
        </a>
      </Scene>
    </Fragment>
  )
}
