/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'
// @ts-ignore
import styles from './Header.module.scss'
import Avatar from '@material-ui/core/Avatar'
import { useDispatch } from 'react-redux'

import { useCreatorState } from '@xrengine/client-core/src/social/reducers/creator/CreatorState'
import { CreatorService } from '@xrengine/client-core/src/social/reducers/creator/CreatorService'
import { PopupsStateService } from '@xrengine/client-core/src/social/reducers/popupsState/PopupsStateService'
import { useTranslation } from 'react-i18next'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'

interface Props {
  logo?: string
  setView: any
}
const AppHeader = ({ setView, onGoRegistration }: any) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [creator, setCreator] = useState({})
  const auth = useAuthState()
  useEffect(() => {
    if (auth.user.id.value) {
      dispatch(CreatorService.getLoggedCreator())
    }
  }, [])
  const creatorState = useCreatorState()

  useEffect(() => {
    setCreator(
      creatorState.creators.fetchingCurrentCreator.value === false && creatorState.creators.currentCreator.value
    )
  }, [])

  return (
    <nav className={styles.headerContainer}>
      <img
        src="/assets/LogoColored.png"
        className={styles.headerLogo}
        alt="ARC"
        style={{
          cursor: 'pointer'
        }}
        onClick={() => {
          onGoRegistration(() => {
            setView('featured')
          })
        }}
      />
      {creator && (
        <Avatar
          onClick={() => {
            onGoRegistration(() => {
              dispatch(PopupsStateService.updateCreatorFormState(true))
            })
          }}
          alt={creator?.username}
          src={creator?.avatar ? creator.avatar : '/assets/userpic.png'}
        />
      )}
    </nav>
  )
}

export default AppHeader
