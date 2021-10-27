/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
// import WhatshotIcon from '@mui/icons-material/Whatshot';

// @ts-ignore
import styles from './Footer.module.scss'
import Avatar from '@mui/material/Avatar'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useCreatorState } from '@xrengine/client-core/src/social/state/CreatorState'
import { CreatorService } from '@xrengine/client-core/src/social/state/CreatorService'
// import { PopupLogin } from "../PopupLogin/PopupLogin";
// import IndexPage from "@xrengine/social/pages/login";
import { PopupsStateService } from '@xrengine/client-core/src/social/state/PopupsStateService'
import ViewMode from '../ViewMode/ViewMode'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'

interface Props {
  setView?: any
}
const AppFooter = ({ setView, onGoRegistration }: any) => {
  const dispatch = useDispatch()
  const creatorState = useCreatorState()
  const auth = useAuthState()
  useEffect(() => {
    if (auth.user.id.value) {
      CreatorService.getLoggedCreator()
    }
  }, [])

  // const checkGuest = authState.get('authUser')?.identityProvider?.type === 'guest' ? true : false;
  const handleOpenCreatorPage = (id) => {
    PopupsStateService.updateCreatorPageState(true, id)
  }

  const onGoHome = () => {
    PopupsStateService.updateCreatorPageState(false)
    PopupsStateService.updateCreatorFormState(false)
    PopupsStateService.updateFeedPageState(false)
    PopupsStateService.updateNewFeedPageState(false)
    PopupsStateService.updateArMediaState(false)
    PopupsStateService.updateShareFormState(false)
    setView('featured')
  }

  return (
    <nav className={styles.footerContainer}>
      {/* <HomeIcon onClick={()=> {checkGuest ? setButtonPopup(true) : history.push('/');}} fontSize="large" className={styles.footerItem}/> */}
      <img src="/assets/tabBar.png" onClick={() => onGoHome()} className={styles.footerItem} />
      {/* <PopupLogin trigger={buttonPopup} setTrigger={setButtonPopup}>
          <IndexPage />
        </PopupLogin> */}
      {/* <AddCircleIcon onClick={()=> {checkGuest ? setButtonPopup(true) : history.push('/newfeed');}} style={{fontSize: '5em'}} className={styles.footerItem}/> */}
      {/* <AddCircleIcon onClick={()=> {handleOpenNewFeedPage()}} style={{fontSize: '5em'}} className={styles.footerItem}/> */}
      <ViewMode onGoRegistration={onGoRegistration} />
      {/*hided for now*/}
      {/* {creator && <WhatshotIcon htmlColor="#FF6201" onClick={()=>{checkGuest ? setButtonPopup(true) : history.push('/notifications');}} /> } */}
      {/* {creator && ( 
          <Avatar onClick={()=> {checkGuest ? setButtonPopup(true) : handleOpenCreatorPage(creator.id);}} 
          alt={creator.username} src={creator.avatar} />
        )} */}
      <Avatar
        onClick={() => {
          // onGoRegistration(() => {
          handleOpenCreatorPage(creatorState.creators.currentCreator?.id?.value)
          // })
        }}
        alt={creatorState.creators.currentCreator?.username?.value}
        className={styles.footerAvatar}
        src={
          creatorState.creators.currentCreator?.avatar?.value
            ? creatorState.creators.currentCreator?.avatar?.value
            : '/assets/userpic.png'
        }
      />
    </nav>
  )
}

export default AppFooter
