import { AuthService } from '@standardcreative/client-core/src/user/state/AuthService'
import { useAuthState } from '@standardcreative/client-core/src/user/state/AuthState'
import { isIOS } from '@standardcreative/client-core/src/util/platformCheck'
import FeedMenu from '../components/FeedMenu'
import { useCreatorState } from '@standardcreative/client-core/src/social/state/CreatorState'
import { CreatorService } from '@standardcreative/client-core/src/social/state/CreatorService'
import React, { useEffect, useState } from 'react'
import { useDispatch } from '@standardcreative/client-core/src/store'

import AppHeader from '../components/Header'

// @ts-ignore
import styles from './index.module.scss'
import AddFilesForm from '../components/AddFilesForm'

const Home = () => {
  const dispatch = useDispatch()
  const auth = useAuthState()

  const [addFilesView, setAddFilesView] = useState(false)
  const [filesTarget, setFilesTarget] = useState([])

  useEffect(() => {
    const user = auth.user
    const userId = user ? user.id.value : null
    if (userId) {
      CreatorService.createCreator()
    }
  }, [auth.isLoggedIn.value, auth.user.id.value])

  useEffect(() => {
    AuthService.doLoginAuto(true)
  }, [])

  const creatorsState = useCreatorState()
  const currentCreator = creatorsState.creators.currentCreator.value

  return (
    <div className={styles.viewport}>
      {!addFilesView && (
        <AppHeader title={'CREATOR'} setAddFilesView={setAddFilesView} setFilesTarget={setFilesTarget} />
      )}
      {currentCreator && !addFilesView && <FeedMenu />}
      {addFilesView && (
        <AddFilesForm filesTarget={filesTarget} setAddFilesView={setAddFilesView} setFilesTarget={setFilesTarget} />
      )}
    </div>
  )
}

export default Home
