import { updateUserAvatarId, updateUsername } from '@xrengine/client-core/src/user/reducers/auth/service'
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Fab from '@material-ui/core/Fab'
import { bindActionCreators, Dispatch } from 'redux'
import { useTranslation } from 'react-i18next'
import styles from './UserProfile.module.scss'
import { selectCurrentScene } from '@xrengine/client-core/src/world/reducers/scenes/selector'
import { selectAuthState } from '@xrengine/client-core/src/user/reducers/auth/selector'
import { fetchAvatarList } from '@xrengine/client-core/src/user/reducers/auth/service'
import { getAvatarURLFromNetwork, Views } from '@xrengine/client-core/src/user/components/UserMenu/util'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { EditPencil } from '../icons/EditPencil'
import { SaveDisable } from '../icons/SaveDisable'
import { SaveEnable } from '../icons/SaveEnable'
import { SearchIcon } from '../icons/Search'
import { Close } from '../icons/Close'
import { LazyImage } from '@xrengine/client-core/src/common/components/LazyImage'

interface Props {
  currentScene?: any
  showUserProfile?: any
  authState?: any
  fetchAvatars: any
  isUserProfileShowing?: Function
  showHideProfile?: Function
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    currentScene: selectCurrentScene(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateUsername: bindActionCreators(updateUsername, dispatch),
  fetchAvatars: bindActionCreators(fetchAvatarList, dispatch),
  updateUserAvatarId: bindActionCreators(updateUserAvatarId, dispatch)
})

const UserProfileScreen = (props: Props) => {
  const { currentScene, authState, fetchAvatars, isUserProfileShowing, showHideProfile } = props

  const { t } = useTranslation()
  const selfUser = authState?.get('user') || {}
  const avatarList = authState.get('avatarList') || []
  const [userName, setUsername] = useState(selfUser?.name)
  const [isEditProfile, setEditProfile] = useState(false)
  const [isProfileEdited, setProfileEdited] = useState(false)
  const [errorUsername, setErrorUsername] = useState(false)
  const [searchLocation, setSearchLocation] = useState('')
  const searchLocationRef = React.useRef<HTMLInputElement>()
  const userNameRef = React.useRef<HTMLInputElement>()
  const [searchCursorPosition, setSearchCursorPosition] = React.useState(0)
  const [isAvatarLoaded, setAvatarLoaded] = useState(false)

  useEffect(() => {
    selfUser && setUsername(selfUser.name)
  }, [selfUser.name])

  useEffect(() => {
    fetchAvatars()
  }, [isAvatarLoaded])

  const updateUserName = (e) => {
    e.preventDefault()
    handleUpdateUsername()
  }

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
    if (!e.target.value) setErrorUsername(true)

    if (!isProfileEdited) {
      setProfileEdited(true)
    }
  }

  const handleUpdateUsername = () => {
    const name = userName.trim()
    if (!name) return
    if (selfUser.name.trim() !== name) {
      updateUsername(selfUser.id, name)
    }
  }

  const handleSearchLocationChange = (event: any): void => {
    const location = event.target.value
    setSearchLocation(location)
  }

  const handleEditProfile = (): void => {
    if (isEditProfile) {
      //save edit profile detail
      setEditProfile(false)
      setProfileEdited(false)
    } else {
      setEditProfile(true)
    }
  }

  const handleCloseProfile = (): void => {
    showHideProfile(false)
  }

  const renderAvatarList = () => {
    const avatarListData = []
    if (avatarList != undefined) {
      var avatarLimit = 8

      if (avatarList.length < avatarLimit) {
        avatarLimit = avatarList.length
      }

      for (let i = 0; i < avatarLimit; i++) {
        try {
          const characterAvatar = avatarList[i]
          avatarListData.push(
            <Card className={styles.profileImage}>
              <LazyImage
                key={characterAvatar.avatar.id}
                src={characterAvatar['user-thumbnail'].url}
                alt={characterAvatar.avatar.name}
              />
            </Card>
          )
        } catch (e) {}
      }
    }
    return <div className={styles.profileImages}>{avatarListData}</div>
  }

  if (isUserProfileShowing === false) return null
  return (
    <div>
      <section className={styles.blockbg}>
        <div className={styles.avatarBlock}>
          <img src={getAvatarURLFromNetwork(Network.instance, selfUser?.id)} />
          <div className={styles.avatarBtn} onClick={handleEditProfile}>
            {!isEditProfile ? <EditPencil /> : isProfileEdited ? <SaveEnable /> : <SaveDisable />}
          </div>
        </div>
        <div className={styles.userName}>
          {isEditProfile ? (
            <TextField
              className={styles.userNameFieldContainer}
              margin="normal"
              multiline={false}
              fullWidth
              id="userName"
              label={'Enter your name...'}
              name="userName"
              autoFocus
              autoComplete="off"
              value={userName}
              inputProps={{
                maxLength: 1000,
                'aria-label': 'naked'
              }}
              InputLabelProps={{ shrink: false }}
              onChange={handleUsernameChange}
              inputRef={userNameRef}
              onClick={() => (userNameRef as any)?.current?.focus()}
              onKeyDown={(e) => {}}
            />
          ) : (
            <h3> {userName != null && userName.length > 0 ? userName : 'Enter your name...'}</h3>
          )}
        </div>
        {isEditProfile && renderAvatarList()}
        <Card className={styles['search-view']}>
          <CardContent className={styles['search-box']} style={{ boxShadow: 'none' }}>
            <TextField
              className={styles.locationFieldContainer}
              margin="normal"
              multiline={false}
              fullWidth
              id="searchLocation"
              label={'Where would you like to go?'}
              name="searchLocation"
              autoFocus
              autoComplete="off"
              value={searchLocation}
              inputProps={{
                maxLength: 1000,
                'aria-label': 'naked'
              }}
              InputLabelProps={{ shrink: false }}
              onChange={handleSearchLocationChange}
              inputRef={searchLocationRef}
              onClick={() => (searchLocationRef as any)?.current?.focus()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault()
                  const selectionStart = (e.target as HTMLInputElement).selectionStart
                  setSearchCursorPosition(selectionStart)
                } else if (e.key === 'Enter' && !e.ctrlKey) {
                  e.preventDefault()
                  //setSearchCursorPosition(0)
                }
              }}
            />
            <div className={styles.searchIcon}>
              <SearchIcon />
            </div>
          </CardContent>
        </Card>

        <Card className={styles['map-view']}>
          <CardContent className={styles['map-box']}></CardContent>
        </Card>

        <Fab className={styles.closeProfile} color="primary" onClick={handleCloseProfile}>
          <Close />
        </Fab>
      </section>
    </div>
  )
}
export default connect(mapStateToProps, mapDispatchToProps)(UserProfileScreen)
