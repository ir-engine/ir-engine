/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect, useState } from 'react'
// @ts-ignore
import styles from './Header.module.scss'
import Avatar from '@material-ui/core/Avatar'
import { useDispatch } from '@xrengine/client-core/src/store'

import { useCreatorState } from '@xrengine/client-core/src/social/services/CreatorService'
import { CreatorService } from '@xrengine/client-core/src/social/services/CreatorService'
import { PopupsStateService } from '@xrengine/client-core/src/social/services/PopupsStateService'
import { useTranslation } from 'react-i18next'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useHistory } from 'react-router-dom'

const AppHeader = ({ setView, onGoRegistration }: any) => {
  const history = useHistory()
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
      {creator &&
        {
          /*!checkGuest*/
        } && (
          <Avatar
            onClick={() => {
              onGoRegistration(() => {
                history.push('/editCreator')
              })
            }}
            alt={creator?.username}
            src={creator?.avatar ? creator.avatar : '/assets/userpic.png'}
            style={{
              cursor: 'pointer'
            }}
          />
        )}
    </nav>
  )
}

export default AppHeader
