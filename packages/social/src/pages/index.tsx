// import {Stories} from '@xrengine/social/src/components/Stories';
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { SnackbarProvider } from 'notistack'

import AppHeader from '@xrengine/social/src/components/Header'
import FeedMenu from '@xrengine/social/src/components/FeedMenu'
import AppFooter from '@xrengine/social/src/components/Footer'

// import {Stories} from '@xrengine/client-core/src/socialmedia/components/Stories';

import { User } from '@xrengine/common/src/interfaces/User'

import CreatorPopup from '@xrengine/social/src/components/popups/CreatorPopup'
import FeedPopup from '@xrengine/social/src/components/popups/FeedPopup'
import CreatorFormPopup from '@xrengine/social/src/components/popups/CreatorFormPopup'
import ArMediaPopup from '@xrengine/social/src/components/popups/ArMediaPopup'
import FeedFormPopup from '@xrengine/social/src/components/popups/FeedFormPopup'
import SharedFormPopup from '@xrengine/social/src/components/popups/SharedFormPopup'
import WebXRStart from '@xrengine/social/src/components/popups/WebXR'
import { selectCreatorsState } from '@xrengine/social/src/reducers/creator/selector'
import { createCreator } from '@xrengine/social/src/reducers/creator/service'
import { selectWebXrNativeState } from '@xrengine/social/src/reducers/webxr_native/selector'
import { changeWebXrNative, getWebXrNative } from '@xrengine/social/src/reducers/webxr_native/service'

import { useDispatch } from 'react-redux'
// @ts-ignore
import styles from './index.module.scss'
import Button from '@material-ui/core/Button'

// import image from '/static/images/image.jpg'
// import mockupIPhone from '/static/images/mockupIPhone.jpg'
import Splash from '@xrengine/social/src/components/Splash'
import TermsAndPolicy from '@xrengine/social/src/components/TermsandPolicy'
import Blocked from '@xrengine/social/src/components/Blocked'
import Registration from '@xrengine/social/src/components/Registration'
// import { WebXRStart } from '../components/popups/WebXR'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state),
    webxrnativeState: selectWebXrNativeState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  //doLoginAuto: bindActionCreators(AuthService.doLoginAuto, dispatch),
  createCreator: bindActionCreators(createCreator, dispatch),
  getWebXrNative: bindActionCreators(getWebXrNative, dispatch),
  changeWebXrNative: bindActionCreators(changeWebXrNative, dispatch)
})

import { getStoredAuthState } from '@xrengine/client-core/src/persisted.store'
import App from './App'

const Home = ({
  createCreator,
  //doLoginAuto,
  creatorsState,
  webxrnativeState,
  changeWebXrNative,
  getWebXrNative
}) => {
  const dispatch = useDispatch()
  const auth = useAuthState()

  /*hided for now*/

  const authData = getStoredAuthState()
  const accessToken = authData?.authUser ? authData.authUser.accessToken : undefined

  useEffect(() => {
    if (accessToken) {
      dispatch(AuthService.doLoginAuto(true))
      getWebXrNative()
    }
  }, [accessToken])

  useEffect(() => {
    if (auth?.authUser?.accessToken) {
      createCreator()
    }
  }, [auth.isLoggedIn.value, auth.user.id.value])

  const [onborded, setOnborded] = useState(true)
  const [feedOnborded, setFeedOnborded] = useState(true)
  const [splashTimeout, setSplashTimeout] = useState(true)
  const [feedHintsOnborded, setFeedHintsOnborded] = useState(true)
  const [registrationForm, setRegistrationForm] = useState(true)
  const [view, setView] = useState('featured')

  const currentCreator = creatorsState.get('currentCreator')
  const currentTime = new Date(Date.now()).toISOString()

  useEffect(() => {
    if (!!currentCreator && !!currentCreator.createdAt) {
      currentTime.slice(0, -5) === currentCreator.createdAt.slice(0, -5) && setOnborded(false)
    }
  }, [currentCreator])

  const webxrRecorderActivity = webxrnativeState.get('webxrnative')

  const changeOnboarding = () => {
    setOnborded(true)
    setFeedOnborded(false)
    setFeedHintsOnborded(false)
  }
  const platformClass = isIOS ? styles.isIos : ''
  const hideContentOnRecord = webxrRecorderActivity ? styles.hideContentOnRecord : ''

  // if (!currentCreator || currentCreator === null || (splashTimeout && currentCreator.isBlocked == false)) {
  //   //add additional duration Splash after initialized user
  //   const splash = setTimeout(() => {
  //     setSplashTimeout(false)
  //     clearTimeout(splash)
  //   }, 5000)
  //   return <Splash />
  // }

  // if (currentCreator.isBlocked == true) {
  //   return (
  //     <div>
  //       <Splash />
  //       <Blocked />
  //     </div>
  //   )
  // }

  // if (auth.get('user').userRole !== 'user') {
  //   return <Registration />
  // }

  // if (!onborded) return <Onboard setOnborded={changeOnboarding} image={image} mockupIPhone={mockupIPhone} />

  return <SnackbarProvider maxSnack={3}>{!accessToken ? <Registration /> : <App />}</SnackbarProvider>
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
