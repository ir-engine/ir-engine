import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import { NavigateNext, NavigateBefore } from '@material-ui/icons'
import Fab from '@material-ui/core/Fab'
import { useTranslation } from 'react-i18next'
import styles from './UserProfile.module.scss'
import { useSceneState } from '@xrengine/client-core/src/world/reducers/scenes/SceneState'
import { useAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import { AuthService } from '@xrengine/client-core/src/user/reducers/auth/AuthService'
import { getAvatarURLFromNetwork, Views } from '@xrengine/client-core/src/user/components/UserMenu/util'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { SearchIcon } from '../icons/Search'
import { Close } from '../icons/Close'
import { LazyImage } from '@xrengine/client-core/src/common/components/LazyImage'
// import MapView from '../MapLocationSelection'

interface Props {
  showUserProfile?: any
  isUserProfileShowing?: any
  showHideProfile?: Function
}

const mapStateToProps = (state: any): any => {
  return {}
}

const UserProfileScreen = (props: Props) => {
  const { isUserProfileShowing, showHideProfile } = props
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const authState = useAuthState()
  const selfUser = authState.user
  const avatarList = authState.avatarList.value
  const [userName, setUsername] = useState(selfUser?.name.value)
  const [isEditProfile, setEditProfile] = useState(false)
  const [isProfileEdited, setProfileEdited] = useState(false)
  const [errorUsername, setErrorUsername] = useState(false)
  const [searchLocation, setSearchLocation] = useState('')
  const searchLocationRef = React.useRef<HTMLInputElement>()
  const userNameRef = React.useRef<HTMLInputElement>()
  const [searchCursorPosition, setSearchCursorPosition] = React.useState(0)
  const [isAvatarLoaded, setAvatarLoaded] = useState(false)
  const [page, setPage] = useState(0)
  const imgPerPage = 8
  const [selectedAvatarId, setSelectedAvatarId] = useState('')

  useEffect(() => {
    selfUser && setUsername(selfUser.name.value)
  }, [selfUser.name.value])

  useEffect(() => {
    dispatch(AuthService.fetchAvatarList())
  }, [isAvatarLoaded])

  useEffect(() => {
    if (page * imgPerPage >= avatarList.length) {
      if (page <= 0) return
      setPage(page - 1)
    }
  }, [avatarList])

  const loadNextAvatars = (e) => {
    e.preventDefault()
    if ((page + 1) * imgPerPage >= avatarList.length) return
    setPage(page + 1)
  }
  const loadPreviousAvatars = (e) => {
    e.preventDefault()
    if (page === 0) return
    setPage(page - 1)
  }

  const selectAvatar = (avatarResources: any) => {
    const avatar = avatarResources.avatar

    setSelectedAvatarId(avatar.name)
    if (selfUser.avatarId.value !== avatar.name) {
      dispatch(
        AuthService.updateUserAvatarId(
          selfUser.id.value,
          avatar.name,
          avatar.url,
          avatarResources['user-thumbnail'].url
        )
      )
    }
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
    if (selfUser.name.value.trim() !== name) {
      dispatch(AuthService.updateUsername(selfUser.id.value, name))
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

      if (isProfileEdited) {
        handleUpdateUsername()
      }
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
      const startIndex = page * imgPerPage
      const endIndex = Math.min(startIndex + imgPerPage, avatarList.length)

      for (let i = startIndex; i < endIndex; i++) {
        try {
          const characterAvatar = avatarList[i]
          avatarListData.push(
            <Card key={`avatar_${i}`} className={styles.profileImage} onClick={() => selectAvatar(characterAvatar)}>
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
    return (
      <div>
        <div className={styles.profileImages}>{avatarListData}</div>
        <div className={styles.avatarPagination}>
          <button
            type="button"
            key={'loadPreviousAvatars'}
            className={`${styles.iconBlock} ${page === 0 ? styles.disabled : ''}`}
            onClick={loadPreviousAvatars}
          >
            <NavigateBefore />
          </button>
          <button
            type="button"
            key={'loadNextAvatars'}
            className={`${styles.iconBlock} ${(page + 1) * imgPerPage >= avatarList.length ? styles.disabled : ''}`}
            onClick={loadNextAvatars}
          >
            <NavigateNext />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className={`${styles.blockbg} ${isUserProfileShowing === false ? styles.hideProfile : ''}`}>
        <div className={styles.avatarBlock}>
          <img src={getAvatarURLFromNetwork(Network.instance, selfUser?.id.value)} />
          <div
            className={`${styles.avatarBtn} ${
              !isEditProfile ? styles.editBtn : isProfileEdited ? styles.enableBtn : styles.disableBtn
            }`}
            onClick={handleEditProfile}
          >
            <img
              src={
                !isEditProfile
                  ? '/static/edit.png'
                  : isProfileEdited
                  ? '/static/Rightenable.png'
                  : '/static/Rightdisable.png'
              }
            />
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
        {/*<Card className={styles['search-view']}>
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
*/}
        {/* <div className={styles.mapView}>
          <MapView />
        </div> */}
        {!isEditProfile && (
          <div className={styles.profileButton}>
            {' '}
            <Fab className={styles.closeProfile} color="primary" onClick={handleCloseProfile}>
              <Close />
            </Fab>
          </div>
        )}
      </section>
    </div>
  )
}
export default connect(mapStateToProps)(UserProfileScreen)
