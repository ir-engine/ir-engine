/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
import styles from './Header.module.scss'
import Avatar from '@material-ui/core/Avatar'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { selectCreatorsState } from '../../reducers/creator/selector'
import { getLoggedCreator } from '../../reducers/creator/service'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import { updateCreatorFormState } from '../../reducers/popupsState/service'
import { useTranslation } from 'react-i18next'

const mapStateToProps = (state: any): any => {
  return {
    creatorState: selectCreatorsState(state),
    authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getLoggedCreator: bindActionCreators(getLoggedCreator, dispatch),
  updateCreatorFormState: bindActionCreators(updateCreatorFormState, dispatch)
})

interface Props {
  creatorState?: any
  getLoggedCreator?: any
  logo?: string
  authState?: any
  updateCreatorFormState?: typeof updateCreatorFormState
}
const AppHeader = ({ creatorState, getLoggedCreator, logo, authState, updateCreatorFormState }: Props) => {
  const { t } = useTranslation()
  useEffect(() => getLoggedCreator(), [])
  const creator =
    creatorState && creatorState.get('fetchingCurrentCreator') === false && creatorState.get('currentCreator')
  /* Hided for now */
  // const checkGuest = authState.get('authUser')?.identityProvider?.type === 'guest' ? true : false;

  return (
    <nav className={styles.headerContainer}>
      {logo && <img src={logo} className="header-logo" alt="ARC" />}
      {creator &&
        {
          /*!checkGuest*/
        } && (
          <Avatar
            onClick={() => updateCreatorFormState(true)}
            alt={creator.username}
            src={creator.avatar ? creator.avatar : '/assets/userpic.png'}
          />
        )}
    </nav>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AppHeader)
