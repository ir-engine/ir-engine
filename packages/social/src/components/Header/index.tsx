/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
// @ts-ignore
import styles from './Header.module.scss'
import Avatar from '@material-ui/core/Avatar'
import { useDispatch } from 'react-redux'

import { useCreatorState } from '../../reducers/creator/CreatorState'
import { CreatorService } from '../../reducers/creator/CreatorService'
import { PopupsStateService } from '../../reducers/popupsState/PopupsStateService'
import { useTranslation } from 'react-i18next'

interface Props {
  logo?: string
  setView: any
}
const AppHeader = ({ setView, onGoRegistration }: any) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch(CreatorService.getLoggedCreator())
  }, [])
  const creatorState = useCreatorState()
  const creator =
    creatorState.creators.fetchingCurrentCreator.value === false && creatorState.creators.currentCreator.value
  /* Hided for now */
  // const checkGuest = authState.get('authUser')?.identityProvider?.type === 'guest' ? true : false;

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
