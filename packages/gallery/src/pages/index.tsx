import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'
import FeedMenu from '../components/FeedMenu'
import { selectCreatorsState } from '@xrengine/social/src/reducers/creator/selector'
import { createCreator } from '@xrengine/social/src/reducers/creator/service'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import AppHeader from '../components/Header'

// @ts-ignore
import styles from './index.module.scss'

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  //doLoginAuto: bindActionCreators(AuthService.doLoginAuto, dispatch),
  createCreator: bindActionCreators(createCreator, dispatch)
})

const Home = ({ createCreator, creatorsState }) => {

  const dispatch = useDispatch()
  const auth = useAuthState()

  useEffect(() => {
      const user = auth.user
      const userId = user ? user.id.value : null
      if (userId) {
        createCreator()
      }
  }, [auth])

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])

  const [view, setView] = useState('featured')
  const currentCreator = creatorsState.get('currentCreator')

  return (
    <div className={styles.viewport}>
      <AppHeader title={'CREATOR'} />
      {currentCreator ? <FeedMenu view={view} setView={setView} /> : ''}
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
