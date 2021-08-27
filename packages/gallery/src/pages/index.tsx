import FeedMenu from '@xrengine/client-core/src/socialmedia/components/FeedMenu'
import FeedOnboarding from '@xrengine/client-core/src/socialmedia/components/FeedOnboarding'
import Onboard from '@xrengine/client-core/src/socialmedia/components/OnBoard'
import ArMediaPopup from '@xrengine/client-core/src/socialmedia/components/popups/ArMediaPopup'
import CreatorFormPopup from '@xrengine/client-core/src/socialmedia/components/popups/CreatorFormPopup'
import CreatorPopup from '@xrengine/client-core/src/socialmedia/components/popups/CreatorPopup'
import FeedFormPopup from '@xrengine/client-core/src/socialmedia/components/popups/FeedFormPopup'
import FeedPopup from '@xrengine/client-core/src/socialmedia/components/popups/FeedPopup'
import SharedFormPopup from '@xrengine/client-core/src/socialmedia/components/popups/SharedFormPopup'
import Splash from '@xrengine/client-core/src/socialmedia/components/Splash'
import { selectCreatorsState } from '@xrengine/client-core/src/socialmedia/reducers/creator/selector'
import { createCreator } from '@xrengine/client-core/src/socialmedia/reducers/creator/service'
// import {Stories} from '@xrengine/client-core/src/socialmedia/components/Stories';
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import styles from './index.module.scss'
import image from '/static/images/image.jpg'
import mockupIPhone from '/static/images/mockupIPhone.jpg'





const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state),
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  createCreator: bindActionCreators(createCreator, dispatch)
})

const Home = ({
  createCreator,
  doLoginAuto,
  auth,
  creatorsState
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
  }, [])

  const [onborded, setOnborded] = useState(true)
  const [feedOnborded, setFeedOnborded] = useState(true)
  const [feedHintsOnborded, setFeedHintsOnborded] = useState(true)

  const currentCreator = creatorsState.get('currentCreator')
  const currentTime = new Date(Date.now()).toISOString()

  useEffect(() => {
    if (!!currentCreator && !!currentCreator.createdAt) {
      currentTime.slice(0, -5) === currentCreator.createdAt.slice(0, -5) && setOnborded(false)
    }
  }, [currentCreator])

  const changeOnboarding = () => {
    setOnborded(true)
    setFeedOnborded(false)
    setFeedHintsOnborded(false)
  }
  const platformClass = isIOS ? styles.isIos : ''

  if (!currentCreator || currentCreator === null) return <Splash />

  if (!onborded) return <Onboard setOnborded={changeOnboarding} image={image} mockupIPhone={mockupIPhone} />

  return (
    <div className={platformClass + ' '}>
      {!feedOnborded && <FeedOnboarding setFeedOnborded={setFeedOnborded} />}
      <div className={styles.viewport}>
        {/* <Stories stories={stories} /> */}
        <FeedMenu />

        <ArMediaPopup />
        <CreatorPopup />
        <FeedPopup />
        <CreatorFormPopup />
        <FeedFormPopup />
        <SharedFormPopup />
      </div>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
