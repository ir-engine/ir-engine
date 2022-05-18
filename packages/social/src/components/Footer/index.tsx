/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React, { useEffect } from 'react'
// import WhatshotIcon from '@material-ui/icons/Whatshot';

// @ts-ignore
import styles from './Footer.module.scss'
import Avatar from '@material-ui/core/Avatar'
import { useDispatch } from '@xrengine/client-core/src/store'
import { useCreatorState } from '@xrengine/client-core/src/social/services/CreatorService'
import { CreatorService } from '@xrengine/client-core/src/social/services/CreatorService'
import ViewMode from '../ViewMode/ViewMode'
import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
import { useHistory } from 'react-router-dom'

const AppFooter = ({ onGoRegistration, setView }: any) => {
  const history = useHistory()
  const dispatch = useDispatch()
  const creatorState = useCreatorState()
  const auth = useAuthState()
  useEffect(() => {
    if (auth.user.id.value) {
      CreatorService.getLoggedCreator()
    }
  }, [])

  // const checkGuest = authState.get('authUser')?.identityProvider?.type === 'guest' ? true : false;

  return (
    <nav className={styles.footerContainer}>
      {/* <HomeIcon onClick={()=> {checkGuest ? setButtonPopup(true) : history.push('/');}} fontSize="large" className={styles.footerItem}/> */}
      <img
        src="/assets/tabBar.png"
        onClick={() => {
          if (setView) {
            setView('featured')
          }
          history.push('/')
        }}
        className={styles.footerItem}
        style={{
          cursor: 'pointer'
        }}
      />
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
          history.push(`/creator/${creatorState.creators.currentCreator?.id?.value}`)
          // })
        }}
        style={{
          cursor: 'pointer'
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
