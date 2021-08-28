// import {Stories} from '@xrengine/social/src/components/Stories';
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'
import FeedMenu from '@xrengine/social/src/components/FeedMenu'
import FeedOnboarding from '@xrengine/social/src/components/FeedOnboarding'
import AppFooter from '@xrengine/social/src/components/Footer'
import AppHeader from '@xrengine/social/src/components/Header'
import Onboard from '@xrengine/social/src/components/OnBoard'
import ArMediaPopup from '@xrengine/social/src/components/popups/ArMediaPopup'
import CreatorFormPopup from '@xrengine/social/src/components/popups/CreatorFormPopup'
import CreatorPopup from '@xrengine/social/src/components/popups/CreatorPopup'
import FeedFormPopup from '@xrengine/social/src/components/popups/FeedFormPopup'
import FeedPopup from '@xrengine/social/src/components/popups/FeedPopup'
import SharedFormPopup from '@xrengine/social/src/components/popups/SharedFormPopup'
import WebXRStart from '@xrengine/social/src/components/popups/WebXR'
import Splash from '@xrengine/social/src/components/Splash'
import { selectCreatorsState } from '@xrengine/social/src/reducers/creator/selector'
import { createCreator } from '@xrengine/social/src/reducers/creator/service'
import { selectWebXrNativeState } from '@xrengine/social/src/reducers/webxr_native/selector'
import { changeWebXrNative, getWebXrNative } from '@xrengine/social/src/reducers/webxr_native/service'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import styles from './index.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state),
    creatorsState: selectCreatorsState(state),
    webxrnativeState: selectWebXrNativeState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  createCreator: bindActionCreators(createCreator, dispatch),
  getWebXrNative: bindActionCreators(getWebXrNative, dispatch),
  changeWebXrNative: bindActionCreators(changeWebXrNative, dispatch)
})

const Home = ({
  createCreator,
  doLoginAuto,
  auth,
  creatorsState,
  webxrnativeState,
  changeWebXrNative,
  getWebXrNative
}) => {
  /*hided for now*/

  useEffect(() => {
    if (auth) {
      // const user = auth.get('authUser')?.identityProvider.type === 'guest' ? auth.get('user') as User : auth.get('authUser')?.identityProvider as User;
      //   const userId = user ? user.id : null;
      //   if(userId){}
      createCreator()
    }
  }, [auth])

  useEffect(() => {
    doLoginAuto(true)
    getWebXrNative()
  }, [])

  const [onboarded, setOnboarded] = useState(true)
  const [feedOnborded, setFeedOnborded] = useState(true)
  const [feedHintsOnborded, setFeedHintsOnborded] = useState(true)

  const currentCreator = creatorsState.get('currentCreator')
  const currentTime = new Date(Date.now()).toISOString()

  useEffect(() => {
    if (!!currentCreator && !!currentCreator.createdAt) {
      currentTime.slice(0, -5) === currentCreator.createdAt.slice(0, -5) && setOnboarded(false)
    }
  }, [currentCreator])

  const webxrRecorderActivity = webxrnativeState.get('webxrnative')

  const changeOnboarding = () => {
    setOnboarded(true)
    setFeedOnborded(false)
    setFeedHintsOnborded(false)
  }
  const platformClass = isIOS ? styles.isIos : ''
  const hideContentOnRecord = webxrRecorderActivity ? styles.hideContentOnRecord : ''

  if (!currentCreator || currentCreator === null) return <Splash />

  if (!onboarded)
    return (
      <Onboard
        setOnboarded={changeOnboarding}
        image={'/static/images/image.jpg'}
        mockupIPhone={'/static/images/mockupIPhone.jpg'}
      />
    )

  return (
    <div className={platformClass + ' ' + hideContentOnRecord}>
      {!feedOnborded && <FeedOnboarding setFeedOnborded={setFeedOnborded} />}
      <div className={webxrRecorderActivity ? styles.hideContent + ' ' + styles.viewport : styles.viewport}>
        <AppHeader title={'CREATOR'} />
        {/* <Stories stories={stories} /> */}
        <FeedMenu />
        <AppFooter />

        <ArMediaPopup />
        <WebXRStart
          feedHintsOnborded={feedHintsOnborded}
          webxrRecorderActivity={webxrRecorderActivity}
          setContentHidden={changeWebXrNative}
          setFeedHintsOnborded={setFeedHintsOnborded}
        />
        <CreatorPopup webxrRecorderActivity={webxrRecorderActivity} />
        <FeedPopup webxrRecorderActivity={webxrRecorderActivity} />
        <CreatorFormPopup webxrRecorderActivity={webxrRecorderActivity} />
        <FeedFormPopup />
        <SharedFormPopup />
      </div>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
