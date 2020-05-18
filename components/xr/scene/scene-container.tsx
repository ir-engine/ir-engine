import { useSelector, useDispatch } from 'react-redux'
import { selectAppState } from '../../../redux/app/selector'
import { setAppLoaded, setAppInVrMode } from '../../../redux/app/actions'
import { Scene } from 'aframe-react'
import SvgVr from '../../icons/svg/Vr'
import LoadingScreen from '../../ui/Loader'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import isExternalUrl from '../../../utils/isExternalUrl'

type Props = {
  children: any
}
export default function SceneContainer({ children }: Props): any {
  const dispatch = useDispatch()
  const loaded = useSelector(state => selectAppState(state)).get('loaded')
  const setLoaded = loaded => dispatch(setAppLoaded(loaded))
  const setInVrMode = inVrMode => dispatch(setAppInVrMode(inVrMode))
  const router = useRouter()
  const navigateToUrl = e => {
    let url = e.detail.url
    setLoaded(false)
    if (isExternalUrl(url)) {
      window.location.href = url
    } else {
      // sometimes the url given is doesn't start with '/' meaning it is invalid and errors
      // this forces it to start with '/'
      if (!url.startsWith('/')) {
        url = '/' + url
      }
      // navigate to internal url using next/router
      router.push(url)
    }
  }
  useEffect(() => {
    document.addEventListener('navigate', navigateToUrl)
    return () => {
      document.removeEventListener('navigate', navigateToUrl)
    }
  }, [navigateToUrl])
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
    </>
  )
}
