import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'

import AppHeader from '../components/Header'
import FeedMenu from '../components/FeedMenu'
import { selectCreatorsState } from '../reducers/creator/selector'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { doLoginAuto } from '@xrengine/client-core/src/user/reducers/auth/service'
import { createCreator } from '../reducers/creator/service'
// @ts-ignore
import styles from './index.module.scss'
import AddFilesForm from '../components/AddFilesForm'

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
  const [addFilesView, setAddFilesView] = useState(false)
  const [filesTarget, setFilesTarget] = useState([])

  useEffect(() => {
    if (authState) {
      const user = authState.get('user')
      const userId = user ? user.id : null
      if (userId) {
        createCreator()
      }
    }
  }, [authState])

  useEffect(() => {
    doLoginAuto(true)
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
