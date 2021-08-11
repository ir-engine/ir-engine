/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'

import HomeIcon from '@material-ui/icons/Home'
// import WhatshotIcon from '@material-ui/icons/Whatshot';

import styles from './Footer.module.scss'
import Avatar from '@material-ui/core/Avatar'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { useEffect } from 'react'
import { selectCreatorsState } from '../../reducers/creator/selector'
import { getLoggedCreator } from '../../reducers/creator/service'
import { selectAuthState } from '../../../user/reducers/auth/selector'
// import { PopupLogin } from "../PopupLogin/PopupLogin";
// import IndexPage from "@xrengine/social/pages/login";
import {
  updateArMediaState,
  updateCreatorFormState,
  updateCreatorPageState,
  updateFeedPageState,
  updateNewFeedPageState,
  updateShareFormState
} from '../../reducers/popupsState/service'
import { selectPopupsState } from '../../reducers/popupsState/selector'
import ViewMode from '../ViewMode/ViewMode'

const mapStateToProps = (state: any): any => {
  return {
    creatorState: selectCreatorsState(state),
    authState: selectAuthState(state),
    popupsState: selectPopupsState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getLoggedCreator: bindActionCreators(getLoggedCreator, dispatch),
  updateCreatorPageState: bindActionCreators(updateCreatorPageState, dispatch),
  updateCreatorFormState: bindActionCreators(updateCreatorFormState, dispatch),
  updateFeedPageState: bindActionCreators(updateFeedPageState, dispatch),
  updateArMediaState: bindActionCreators(updateArMediaState, dispatch),
  updateShareFormState: bindActionCreators(updateShareFormState, dispatch)
})
interface Props {
  creatorState?: any
  getLoggedCreator?: any
  updateCreatorPageState?: typeof updateCreatorPageState
  updateNewFeedPageState?: typeof updateNewFeedPageState
  authState?: any
  popupsState?: any
  updateCreatorFormState?: typeof updateCreatorFormState
  updateFeedPageState?: typeof updateFeedPageState
  updateArMediaState?: typeof updateArMediaState
  updateShareFormState?: typeof updateShareFormState
}
const AppFooter = ({
  creatorState,
  getLoggedCreator,
  authState,
  updateCreatorPageState,
  popupsState,
  updateCreatorFormState,
  updateFeedPageState,
  updateArMediaState,
  updateShareFormState
}: Props) => {
  useEffect(() => getLoggedCreator(), [])

  // const checkGuest = authState.get('authUser')?.identityProvider?.type === 'guest' ? true : false;
  const handleOpenCreatorPage = (id) => {
    updateCreatorPageState(true, id)
  }

  const onGoHome = () => {
    updateCreatorPageState(false)
    updateCreatorFormState(false)
    updateFeedPageState(false)
    updateNewFeedPageState(false)
    updateArMediaState(false)
    updateShareFormState(false)
  }

  return (
    <>
      <nav className={styles.footerContainer}>
        {/* <HomeIcon onClick={()=> {checkGuest ? setButtonPopup(true) : history.push('/');}} fontSize="large" className={styles.footerItem}/> */}
        <img src="/assets/tabBar.png" onClick={() => onGoHome()} className={styles.footerItem} />
        {/* <PopupLogin trigger={buttonPopup} setTrigger={setButtonPopup}>
          <IndexPage />
        </PopupLogin> */}
        {/* <AddCircleIcon onClick={()=> {checkGuest ? setButtonPopup(true) : history.push('/newfeed');}} style={{fontSize: '5em'}} className={styles.footerItem}/> */}
        {/* <AddCircleIcon onClick={()=> {handleOpenNewFeedPage()}} style={{fontSize: '5em'}} className={styles.footerItem}/> */}
        <ViewMode />
        {/*hided for now*/}
        {/* {creator && <WhatshotIcon htmlColor="#FF6201" onClick={()=>{checkGuest ? setButtonPopup(true) : history.push('/notifications');}} /> } */}
        {/* {creator && ( 
          <Avatar onClick={()=> {checkGuest ? setButtonPopup(true) : handleOpenCreatorPage(creator.id);}} 
          alt={creator.username} src={creator.avatar} />
        )} */}
        <Avatar
          onClick={() => {
            handleOpenCreatorPage(creatorState?.get('currentCreator')?.id)
          }}
          alt={creatorState.get('currentCreator')?.username}
          className={styles.footerAvatar}
          src={
            creatorState.get('currentCreator')?.avatar
              ? creatorState.get('currentCreator')?.avatar
              : '/assets/userpic.png'
          }
        />
      </nav>
    </>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(AppFooter)
