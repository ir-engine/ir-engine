/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
// @ts-ignore
import styles from './Header.module.scss'
import Avatar from '@material-ui/core/Avatar'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

import { selectCreatorsState } from '../../reducers/creator/selector'
import { getLoggedCreator } from '../../reducers/creator/service'
import { updateCreatorFormState } from '../../reducers/popupsState/service'
import { useTranslation } from 'react-i18next'

const mapStateToProps = (state: any): any => {
  return {
    creatorState: selectCreatorsState(state)
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
  updateCreatorFormState?: typeof updateCreatorFormState
  setView: any
}
const AppHeader = ({ creatorState, getLoggedCreator, updateCreatorFormState, setView }: any) => {
  const { t } = useTranslation()
  useEffect(() => getLoggedCreator(), [])
  const creator =
    creatorState && creatorState.get('fetchingCurrentCreator') === false && creatorState.get('currentCreator')
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
          setView('featured')
        }}
      />
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
