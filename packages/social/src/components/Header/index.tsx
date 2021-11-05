/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'
// @ts-ignore
import styles from './Header.module.scss'
import Avatar from '@mui/material/Avatar'
import { useDispatch } from '@xrengine/client-core/src/store'

import { useCreatorState } from '@xrengine/client-core/src/social/services/CreatorService'
import { CreatorService } from '@xrengine/client-core/src/social/services/CreatorService'
import { PopupsStateService } from '@xrengine/client-core/src/social/services/PopupsStateService'
import { useTranslation } from 'react-i18next'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'

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
      CreatorService.getLoggedCreator()
    }
  }, [])
  const creatorState = useCreatorState()

  useEffect(() => {
    // fixThis
    setCreator(
      creatorState.creators.fetchingCurrentCreator.value === false ? false : creatorState.creators.currentCreator.value
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
              PopupsStateService.updateCreatorFormState(true)
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
