import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'
import FeedMenu from '@xrengine/social/src/components/FeedMenu'
import FeedOnboarding from '@xrengine/social/src/components/FeedOnboarding'
import CreatorFormPopup from '@xrengine/social/src/components/popups/CreatorFormPopup'
import CreatorPopup from '@xrengine/social/src/components/popups/CreatorPopup'
import FeedFormPopup from '@xrengine/social/src/components/popups/FeedFormPopup'
import FeedPopup from '@xrengine/social/src/components/popups/FeedPopup'
import SharedFormPopup from '@xrengine/social/src/components/popups/SharedFormPopup'
import { selectCreatorsState } from '@xrengine/social/src/reducers/creator/selector'
import { createCreator } from '@xrengine/social/src/reducers/creator/service'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import styles from './index.module.scss'

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

const Home = ({ createCreator, doLoginAuto, auth, creatorsState }) => {
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

  const [onborded, setOnboarded] = useState(true)
  const [feedOnborded, setFeedOnborded] = useState(true)
  const [feedHintsOnborded, setFeedHintsOnborded] = useState(true)

  const currentCreator = creatorsState.get('currentCreator')
  const currentTime = new Date(Date.now()).toISOString()

  useEffect(() => {
    if (!!currentCreator && !!currentCreator.createdAt) {
      currentTime.slice(0, -5) === currentCreator.createdAt.slice(0, -5) && setOnboarded(false)
    }
  }, [currentCreator])

  const changeOnboarding = () => {
    setOnboarded(true)
    setFeedOnborded(false)
    setFeedHintsOnborded(false)
  }
  const platformClass = isIOS ? styles.isIos : ''

  return (
    <div className={platformClass + ' '}>
      {!feedOnborded && <FeedOnboarding setFeedOnborded={setFeedOnborded} />}
      <div className={styles.viewport}>
        {/* <Stories stories={stories} /> */}
        <FeedMenu />
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
