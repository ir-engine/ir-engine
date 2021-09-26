import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'
import FeedMenu from '../components/FeedMenu'
import { selectCreatorsState } from '@xrengine/gallery/src/reducers/creator/selector'
import { createCreator } from '@xrengine/gallery/src/reducers/creator/service'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import AppHeader from '../components/Header'

// @ts-ignore
import styles from './index.module.scss'
import AddFilesForm from '../components/AddFilesForm'

const mapStateToProps = (state: any): any => {
  return {
    creatorsState: selectCreatorsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  createCreator: bindActionCreators(createCreator, dispatch)
})

const Home = ({ createCreator, creatorsState }) => {
  const dispatch = useDispatch()
  const auth = useAuthState()

  const [addFilesView, setAddFilesView] = useState(false)
  const [filesTarget, setFilesTarget] = useState([])

  useEffect(() => {
    const user = auth.user
    const userId = user ? user.id.value : null
    if (userId) {
      createCreator()
    }
  }, [auth.isLoggedIn.value, auth.user.id.value])

  useEffect(() => {
    dispatch(AuthService.doLoginAuto(true))
  }, [])

  const currentCreator = creatorsState.get('currentCreator')

  return (
    <div className={styles.viewport}>
      {!addFilesView && (
        <AppHeader title={'CREATOR'} setAddFilesView={setAddFilesView} setFilesTarget={setFilesTarget} />
      )}
      {currentCreator && !addFilesView && <FeedMenu />}
      {addFilesView && <AddFilesForm filesTarget={filesTarget} setAddFilesView={setAddFilesView} />}
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
