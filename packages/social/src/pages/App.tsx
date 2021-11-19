import React, { useEffect, useState } from 'react'
import { useDispatch } from '@xrengine/client-core/src/store'

import { SnackbarProvider } from 'notistack'

import AppHeader from '@xrengine/social/src/components/Header'
import FeedMenu from '@xrengine/social/src/components/FeedMenu'
import AppFooter from '@xrengine/social/src/components/Footer'
import { useCreatorState } from '@xrengine/client-core/src/social/services/CreatorService'
// import {Stories} from '@xrengine/client-core/src/socialmedia/components/Stories';
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useWebxrNativeState } from '@xrengine/client-core/src/social/services/WebxrNativeService'

import { WebxrNativeService } from '@xrengine/client-core/src/social/services/WebxrNativeService'

import CreatorPopup from '@xrengine/social/src/components/popups/CreatorPopup'
import FeedPopup from '@xrengine/social/src/components/popups/FeedPopup'
import CreatorFormPopup from '@xrengine/social/src/components/popups/CreatorFormPopup'
import ArMediaPopup from '@xrengine/social/src/components/popups/ArMediaPopup'
import FeedFormPopup from '@xrengine/social/src/components/popups/FeedFormPopup'
import SharedFormPopup from '@xrengine/social/src/components/popups/SharedFormPopup'
import Onboard from '@xrengine/social/src/components/OnBoard'
import FeedOnboarding from '@xrengine/social/src/components/FeedOnboarding'
// @ts-ignore
import styles from './index.module.scss'
import Button from '@mui/material/Button'

// import image from '/static/images/image.jpg'
// import mockupIPhone from '/static/images/mockupIPhone.jpg'
import Splash from '@xrengine/social/src/components/Splash'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'
import TermsAndPolicy from '@xrengine/social/src/components/TermsandPolicy'
import Blocked from '@xrengine/social/src/components/Blocked'
import WebXRStart from '../components/popups/WebXR'
import { useHistory } from 'react-router-dom'
import TemporarySolution from './TemporarySolution'

import { CreatorAction } from '@xrengine/client-core/src/social/services/CreatorService'

interface Props {}

const Home = (props: Props) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const auth = useAuthState()
  /*hided for now*/
  const [onborded, setOnborded] = useState(true)
  const [feedOnborded, setFeedOnborded] = useState(true)
  const [feedHintsOnborded, setFeedHintsOnborded] = useState(true)
  const [registrationForm, setRegistrationForm] = useState(true)
  const [view, setView] = useState('featured')
  const creatorsState = useCreatorState()
  const currentCreator = creatorsState.creators.currentCreator
  const currentTime = new Date(Date.now()).toISOString()

  useEffect(() => {
    if (!!currentCreator?.value && !!currentCreator?.createdAt?.value) {
      currentTime.slice(0, -5) === currentCreator?.createdAt?.value?.slice(0, -5) && setOnborded(false)
    }
  }, [currentCreator])
  const webxrnativeState = useWebxrNativeState()
  const webxrRecorderActivity = webxrnativeState.webxrnative.value

  const changeOnboarding = () => {
    setOnborded(true)
    setFeedOnborded(false)
    setFeedHintsOnborded(false)
  }
  const platformClass = isIOS ? styles.isIos : ''
  const splashTimeout = creatorsState.creators.splashTimeout.value
  const hideContentOnRecord = webxrRecorderActivity ? styles.hideContentOnRecord : ''

  if (
    !currentCreator?.value ||
    currentCreator?.value === null ||
    (splashTimeout && !currentCreator?.isBlocked?.value)
  ) {
    //add additional duration Splash after initialized user
    const splash = setTimeout(() => {
      dispatch(CreatorAction.setStateCreators(false))
      clearTimeout(splash)
    }, 5000)
    return <Splash />
  }

  const onGoRegistration = (callBack?) => {
    // if (auth.user.userRole.value === 'guest') {
    if (false) {
      history.push('/registration')
    } else if (callBack) {
      callBack()
    }
  }

  if (currentCreator?.isBlocked?.value == true) {
    return (
      <div>
        <Splash />
        <Blocked />
      </div>
    )
  }

  const changeWebXrNative = () => {
    WebxrNativeService.changeWebXrNative()
  }

  // if (!onborded) return <Onboard setOnborded={changeOnboarding} image={image} mockupIPhone={mockupIPhone} />
  return <>null</>
}

export default Home
