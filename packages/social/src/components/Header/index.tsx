/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
// @ts-ignore
import styles from './Header.module.scss'
import Avatar from '@material-ui/core/Avatar'
import { bindActionCreators, Dispatch } from 'redux'
import { connect, useDispatch } from 'react-redux'

import { useCreatorState } from '../../reducers/creator/CreatorState'
import { CreatorService } from '../../reducers/creator/CreatorService'
import { updateCreatorFormState } from '../../reducers/popupsState/service'
import { useTranslation } from 'react-i18next'

const mapStateToProps = (state: any): any => {
  return {}
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateCreatorFormState: bindActionCreators(updateCreatorFormState, dispatch)
})

interface Props {
  logo?: string
  updateCreatorFormState?: typeof updateCreatorFormState
  setView: any
}
const AppHeader = ({ updateCreatorFormState, setView, onGoRegistration }: any) => {
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
                updateCreatorFormState(true)
              })
            }}
            alt={creator?.username}
            src={creator?.avatar ? creator.avatar : '/assets/userpic.png'}
          />
        )}
    </nav>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader)
