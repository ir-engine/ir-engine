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
import { User } from '@xrengine/common/src/interfaces/User'
import { client } from '../../../client-core/src/feathers'

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
  createCreator: bindActionCreators(createCreator, dispatch)
})

const Home = ({ createCreator, doLoginAuto, authState, creatorsState }) => {
  useEffect(() => {
    doLoginAuto(true)
  }, [])

  useEffect(() => {
    if (authState) {
      const user = authState.get('user')
      const userId = user ? user.id : null
      if (userId) {
        createCreator()
      }
    }
  }, [authState])

  return (
    <div className={styles.viewport}>
      <AppHeader title={'CREATOR'} />
      <FeedMenu />
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
