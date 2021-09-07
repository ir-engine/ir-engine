import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'
import FeedMenu from '../components/FeedMenu'
import { selectCreatorsState } from '@xrengine/social/src/reducers/creator/selector'
import { createCreator } from '@xrengine/social/src/reducers/creator/service'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import AppHeader from '../components/Header'
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

  // useEffect(() => {
  //   if (auth) {
  //     // const user = auth.get('authUser')?.identityProvider.type === 'guest' ? auth.get('user') as User : auth.get('authUser')?.identityProvider as User;
  //     //   const userId = user ? user.id : null;
  //     //   if(userId){}
  //     createCreator()
  //   }
  // }, [auth])

  // useEffect(() => {
  //   doLoginAuto(true)
  // }, [])

  // const [onborded, setOnboarded] = useState(true)
  // const [feedOnborded, setFeedOnborded] = useState(true)
  // const [feedHintsOnborded, setFeedHintsOnborded] = useState(true)

  // const currentCreator = creatorsState.get('currentCreator')
  // const currentTime = new Date(Date.now()).toISOString()

  // useEffect(() => {
  //   if (!!currentCreator && !!currentCreator.createdAt) {
  //     currentTime.slice(0, -5) === currentCreator.createdAt.slice(0, -5) && setOnboarded(false)
  //   }
  // }, [currentCreator])

  const platformClass = isIOS ? styles.isIos : ''

  return (
    <div className={platformClass + ' '}>
      <div className={styles.viewport}>
        <AppHeader title={'CREATOR'} />
        <FeedMenu />
      </div>
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
