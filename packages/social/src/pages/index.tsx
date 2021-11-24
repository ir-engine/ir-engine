import React, { useState } from 'react'

import AppHeader from '@xrengine/social/src/components/Header'
import FeedMenu from '@xrengine/social/src/components/FeedMenu'
import { useCreatorState } from '@xrengine/client-core/src/social/services/CreatorService'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'

import ArMediaPopup from '@xrengine/social/src/components/popups/ArMediaPopup'
import FeedFormPopup from '@xrengine/social/src/components/popups/FeedFormPopup'
import SharedFormPopup from '@xrengine/social/src/components/popups/SharedFormPopup'
// @ts-ignore
import Splash from '@xrengine/social/src/components/Splash'
import TermsAndPolicy from '@xrengine/social/src/components/TermsandPolicy'
import Blocked from '@xrengine/social/src/components/Blocked'
import { useHistory } from 'react-router-dom'
import styles from './index.module.scss'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'
import { useWebxrNativeState } from '@xrengine/client-core/src/social/services/WebxrNativeService'
import AppFooter from '@xrengine/social/src/components/Footer'

const Home = () => {
  const history = useHistory()
  const auth = useAuthState()
  /*hided for now*/
  const [view, setView] = useState('featured')
  const creatorsState = useCreatorState()
  const currentCreator = creatorsState.creators.currentCreator
  const webxrnativeState = useWebxrNativeState()
  const webxrRecorderActivity = webxrnativeState.webxrnative.value
  const platformClass = isIOS ? styles.isIos : ''
  const hideContentOnRecord = webxrRecorderActivity ? styles.hideContentOnRecord : ''

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

  // if (!onborded) return <Onboard setOnborded={changeOnboarding} image={image} mockupIPhone={mockupIPhone} />
  return (
    <div className={platformClass + ' ' + hideContentOnRecord}>
      <div className={webxrRecorderActivity ? styles.hideContent + ' ' + styles.viewport : styles.viewport}>
        <AppHeader setView={setView} onGoRegistration={onGoRegistration} />
        {/* <Stories stories={stories} /> */}
        <FeedMenu view={view} setView={setView} />
        <AppFooter setView={setView} onGoRegistration={onGoRegistration} />
        {(currentCreator?.value &&
          (!currentCreator.terms.value || !currentCreator.policy.value) &&
          auth.user.userRole.value === 'user') ||
        (currentCreator?.value &&
          (!currentCreator.terms.value || !currentCreator.policy.value) &&
          auth.user.userRole.value === 'guest') ? (
          <TermsAndPolicy />
        ) : null}
        <ArMediaPopup />
        <FeedFormPopup setView={setView} />
        <SharedFormPopup setView={setView} />
      </div>
    </div>
  )
}

export default Home
